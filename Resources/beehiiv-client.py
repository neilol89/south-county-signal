#!/usr/bin/env python3
"""
Beehiiv API Client — Reusable wrapper for the Beehiiv v2 REST API.

Usage:
    from beehiiv_client import BeehiivClient

    client = BeehiivClient()  # Uses env vars BEEHIIV_API_KEY and BEEHIIV_PUBLICATION_ID
    client.add_subscriber("user@example.com", custom_fields=[{"name": "town", "value": "Narragansett"}])
    posts = client.list_posts(status="confirmed", expand="stats")

Requires: pip install requests
"""

import os
import sys
import json
import time
import requests
from urllib.parse import quote


class BeehiivClient:
    BASE_URL = "https://api.beehiiv.com/v2"

    def __init__(self, api_key=None, publication_id=None):
        self.api_key = api_key or os.environ.get("BEEHIIV_API_KEY")
        self.publication_id = publication_id or os.environ.get("BEEHIIV_PUBLICATION_ID")

        if not self.api_key:
            raise ValueError("BEEHIIV_API_KEY not set. Pass api_key or set the environment variable.")
        if not self.publication_id:
            raise ValueError("BEEHIIV_PUBLICATION_ID not set. Pass publication_id or set the environment variable.")

        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

    def _url(self, path=""):
        return f"{self.BASE_URL}/publications/{self.publication_id}{path}"

    def _request(self, method, path, params=None, data=None):
        url = self._url(path)
        resp = requests.request(method, url, headers=self.headers, params=params, json=data)
        if resp.status_code == 429:
            retry_after = int(resp.headers.get("Retry-After", 5))
            print(f"Rate limited. Retrying in {retry_after}s...")
            time.sleep(retry_after)
            return self._request(method, path, params=params, data=data)
        resp.raise_for_status()
        return resp.json()

    # ── Publications ──
    def get_publication(self, expand=None):
        params = {}
        if expand:
            params["expand"] = expand if isinstance(expand, str) else ",".join(expand)
        return self._request("GET", "", params=params)

    def list_publications(self):
        return requests.get(
            f"{self.BASE_URL}/publications",
            headers=self.headers
        ).json()

    # ── Subscriptions ──
    def add_subscriber(self, email, custom_fields=None, utm_source=None,
                       send_welcome=True, automation_ids=None,
                       double_opt_in="on"):
        data = {
            "email": email,
            "send_welcome_email": send_welcome,
            "reactivate_existing": False,
            "double_opt_in_override": double_opt_in
        }
        if custom_fields:
            data["custom_fields"] = custom_fields
        if utm_source:
            data["utm_source"] = utm_source
        if automation_ids:
            data["automation_ids"] = automation_ids
        return self._request("POST", "/subscriptions", data=data)

    def get_subscriber_by_email(self, email, expand=None):
        params = {}
        if expand:
            params["expand"] = expand if isinstance(expand, str) else ",".join(expand)
        return self._request("GET", f"/subscriptions/by_email/{quote(email)}", params=params)

    def list_subscribers(self, limit=50, cursor=None, status="active", expand=None):
        params = {"limit": limit, "status": status}
        if cursor:
            params["cursor"] = cursor
        if expand:
            params["expand"] = expand if isinstance(expand, str) else ",".join(expand)
        return self._request("GET", "/subscriptions", params=params)

    def list_all_subscribers(self, status="active"):
        all_subs = []
        cursor = None
        while True:
            result = self.list_subscribers(limit=100, cursor=cursor, status=status)
            all_subs.extend(result.get("data", []))
            if not result.get("has_more"):
                break
            cursor = result.get("next_cursor")
            time.sleep(0.15)
        return all_subs

    def update_subscriber(self, subscription_id, custom_fields=None, tier=None):
        data = {}
        if custom_fields:
            data["custom_fields"] = custom_fields
        if tier:
            data["tier"] = tier
        return self._request("PUT", f"/subscriptions/{subscription_id}", data=data)

    def delete_subscriber(self, subscription_id):
        return self._request("DELETE", f"/subscriptions/{subscription_id}")

    def tag_subscriber(self, subscription_id, tags):
        return self._request("POST", f"/subscriptions/{subscription_id}/tags", data={"tags": tags})

    # ── Posts ──
    def list_posts(self, status="all", expand=None, limit=10, page=1):
        params = {"status": status, "limit": limit, "page": page}
        if expand:
            params["expand"] = expand if isinstance(expand, str) else ",".join(expand)
        return self._request("GET", "/posts", params=params)

    def get_post(self, post_id, expand=None):
        params = {}
        if expand:
            params["expand"] = expand if isinstance(expand, str) else ",".join(expand)
        return self._request("GET", f"/posts/{post_id}", params=params)

    def create_post(self, title, body_html, subject=None, preview_text=None,
                    scheduled_at=None, template_id=None, status="draft"):
        """Enterprise only (beta). Creates a post."""
        data = {
            "title": title,
            "body_content": body_html,
            "status": status
        }
        if subject or preview_text:
            data["email_settings"] = {}
            if subject:
                data["email_settings"]["subject"] = subject
            if preview_text:
                data["email_settings"]["preview_text"] = preview_text
        if scheduled_at:
            data["scheduled_at"] = scheduled_at
        if template_id:
            data["post_template_id"] = template_id
        return self._request("POST", "/posts", data=data)

    # ── Segments ──
    def list_segments(self, expand=None):
        params = {}
        if expand:
            params["expand"] = expand if isinstance(expand, str) else ",".join(expand)
        return self._request("GET", "/segments", params=params)

    def get_segment(self, segment_id, expand=None):
        params = {}
        if expand:
            params["expand"] = expand if isinstance(expand, str) else ",".join(expand)
        return self._request("GET", f"/segments/{segment_id}", params=params)

    # ── Custom Fields ──
    def list_custom_fields(self):
        return self._request("GET", "/custom_fields")

    # ── Webhooks ──
    def create_webhook(self, url, event_types, description=None):
        data = {"url": url, "event_types": event_types}
        if description:
            data["description"] = description
        return self._request("POST", "/webhooks", data=data)

    def list_webhooks(self):
        return self._request("GET", "/webhooks")

    def delete_webhook(self, webhook_id):
        return self._request("DELETE", f"/webhooks/{webhook_id}")

    # ── Automations ──
    def enroll_in_automation(self, automation_id, email, double_opt_in="off"):
        data = {"email": email, "double_opt_in_override": double_opt_in}
        return self._request("POST", f"/automations/{automation_id}/journeys", data=data)

    # ── Bulk Operations ──
    def bulk_add_subscribers(self, subscribers, send_welcome=False):
        """
        subscribers: list of dicts with 'email' and optionally 'custom_fields'
        """
        data = {
            "subscriptions": subscribers,
            "send_welcome_email": send_welcome
        }
        return self._request("POST", "/bulk_subscriptions", data=data)

    # ── Post Templates ──
    def list_post_templates(self):
        return self._request("GET", "/post_templates")

    # ── Referral Program ──
    def get_referral_program(self):
        return self._request("GET", "/referral_program")


def main():
    """CLI usage for quick operations."""
    if len(sys.argv) < 2:
        print("Usage: python beehiiv_client.py <command> [args]")
        print("Commands: list-subs, add-sub <email>, get-sub <email>, list-posts, get-post <id>, stats")
        sys.exit(1)

    client = BeehiivClient()
    cmd = sys.argv[1]

    if cmd == "list-subs":
        result = client.list_subscribers(limit=20)
        for sub in result.get("data", []):
            print(f"  {sub['email']} ({sub['status']}) — {sub['id']}")
        print(f"\nTotal shown: {len(result.get('data', []))}")

    elif cmd == "add-sub" and len(sys.argv) >= 3:
        email = sys.argv[2]
        result = client.add_subscriber(email)
        print(f"Added: {result['data']['email']} — {result['data']['id']}")

    elif cmd == "get-sub" and len(sys.argv) >= 3:
        email = sys.argv[2]
        result = client.get_subscriber_by_email(email, expand="stats,custom_fields")
        print(json.dumps(result, indent=2))

    elif cmd == "list-posts":
        result = client.list_posts(expand="stats", limit=5)
        for post in result.get("data", []):
            stats = post.get("stats", {}).get("email", {})
            print(f"  {post['title']}")
            print(f"    Opens: {stats.get('unique_opens', 'N/A')} | Clicks: {stats.get('unique_clicks', 'N/A')}")

    elif cmd == "get-post" and len(sys.argv) >= 3:
        post_id = sys.argv[2]
        result = client.get_post(post_id, expand="stats")
        print(json.dumps(result, indent=2))

    elif cmd == "stats":
        result = client.get_publication(expand=["stats", "active_subscription_count"])
        print(json.dumps(result, indent=2))

    else:
        print(f"Unknown command: {cmd}")
        sys.exit(1)


if __name__ == "__main__":
    main()
