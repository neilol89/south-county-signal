# Beehiiv Integration Patterns

## Overview

Beehiiv integrates with external tools through three mechanisms:
1. **Direct API** — REST API calls from custom code
2. **Webhooks** — Real-time event notifications from Beehiiv to your endpoint
3. **No-Code Platforms** — Zapier and Make.com (officially supported)

---

## Make.com Integration

Make.com (formerly Integromat) is Beehiiv's recommended no-code platform and offers the most flexibility.

### Setup
1. Create a Make.com account (free tier: 1,000 operations/month)
2. Create a new Scenario
3. Search for "beehiiv" in the app list
4. Connect your Beehiiv account using your API key

### Available Triggers (Webhooks)
- **Watch for Subscribers** — fires when a new subscriber is added
- **Custom Webhook** — point to a Make-provided URL from Beehiiv's webhook settings

### Available Actions
- Create/Update/Delete Subscription
- List Subscriptions
- Get Subscription by Email
- List Posts
- Get Post
- List Segments

### Recommended Scenarios for a Local Newsletter

**Scenario 1: Weekly Newsletter Pipeline**
```
Schedule (Thursday 6am)
  → Google Sheets: Read "This Week's Content" sheet
  → HTTP Module: POST content to your newsletter generator endpoint
  → Slack: Send "Draft ready for review" notification
```

**Scenario 2: New Subscriber Welcome + CRM Sync**
```
Beehiiv: Watch for Subscribers
  → Router:
    Branch 1 → Google Sheets: Add to subscriber tracker
    Branch 2 → Slack: Post "#new-subscriber: {email} from {utm_source}"
    Branch 3 → (Optional) Stripe: Check if customer
```

**Scenario 3: Post-Send Analytics Report**
```
Beehiiv Webhook: Post Sent
  → Delay: Wait 24 hours
  → Beehiiv: Get Post (with stats expanded)
  → Google Sheets: Log open rate, click rate, subscriber count
  → Slack: Post weekly performance summary
```

**Scenario 4: Subscriber Segmentation by Town**
```
Beehiiv: Watch for Subscribers
  → Filter: Check custom_field "town"
  → Beehiiv: Add tag based on town value
    "narragansett" → tag: "south-county-core"
    "providence" → tag: "pvd-crossover"
    "westerly" → tag: "westerly-watch-hill"
```

---

## Zapier Integration

### Available Triggers
- New Subscriber
- Subscriber Deleted
- Post Published

### Available Actions
- Create Subscriber
- Update Subscriber
- Find Subscriber
- List Posts

### Example Zaps

**Zap 1: Typeform → Beehiiv**
```
Trigger: New Typeform Response (sign-up form at events)
Action: Beehiiv Create Subscriber
  email: {{email field}}
  custom_fields: [{ name: "signup_source", value: "in-person" }]
  utm_source: "event-signup"
```

**Zap 2: Beehiiv → Google Sheets Tracker**
```
Trigger: New Beehiiv Subscriber
Action: Google Sheets Create Row
  Column A: {{email}}
  Column B: {{created_at}}
  Column C: {{utm_source}}
```

---

## Custom Webhook Server

For full control over integrations, run a lightweight webhook receiver.

### Node.js (Express)
```javascript
const express = require('express');
const app = express();
app.use(express.json());

// Webhook endpoint
app.post('/webhooks/beehiiv', (req, res) => {
  const { event_type, data, event_timestamp, uid } = req.body;

  switch (event_type) {
    case 'subscription.created':
      handleNewSubscriber(data);
      break;
    case 'subscription.deleted':
      handleUnsubscribe(data);
      break;
    case 'post.sent':
      handlePostSent(data);
      break;
    default:
      console.log(`Unknown event: ${event_type}`);
  }

  res.status(200).json({ received: true });
});

function handleNewSubscriber(data) {
  console.log(`New subscriber: ${data.email}`);
  // Add to CRM, send Slack notification, etc.
}

function handleUnsubscribe(data) {
  console.log(`Unsubscribed: ${data.email}`);
  // Update CRM, analytics tracking
}

function handlePostSent(data) {
  console.log(`Post sent: ${data.title}`);
  // Trigger social media posts, analytics logging
}

app.listen(3000, () => console.log('Webhook server on :3000'));
```

### Python (Flask)
```python
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/webhooks/beehiiv', methods=['POST'])
def beehiiv_webhook():
    payload = request.json
    event_type = payload.get('event_type')
    data = payload.get('data', {})

    if event_type == 'subscription.created':
        print(f"New subscriber: {data.get('email')}")
    elif event_type == 'post.sent':
        print(f"Post sent: {data.get('title')}")

    return jsonify({"received": True}), 200

if __name__ == '__main__':
    app.run(port=3000)
```

---

## Python API Client

A reusable client wrapper for Beehiiv API operations:

```python
import os
import requests
import time

class BeehiivClient:
    BASE_URL = "https://api.beehiiv.com/v2"

    def __init__(self, api_key=None, publication_id=None):
        self.api_key = api_key or os.environ.get("BEEHIIV_API_KEY")
        self.publication_id = publication_id or os.environ.get("BEEHIIV_PUBLICATION_ID")
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

    def _url(self, path):
        return f"{self.BASE_URL}/publications/{self.publication_id}{path}"

    def _get(self, path, params=None):
        resp = requests.get(self._url(path), headers=self.headers, params=params)
        resp.raise_for_status()
        return resp.json()

    def _post(self, path, data):
        resp = requests.post(self._url(path), headers=self.headers, json=data)
        resp.raise_for_status()
        return resp.json()

    def _put(self, path, data):
        resp = requests.put(self._url(path), headers=self.headers, json=data)
        resp.raise_for_status()
        return resp.json()

    def _delete(self, path):
        resp = requests.delete(self._url(path), headers=self.headers)
        resp.raise_for_status()
        return resp.json()

    # --- Publications ---
    def get_publication(self, expand=None):
        params = {"expand": expand} if expand else {}
        return self._get("", params)

    # --- Subscriptions ---
    def add_subscriber(self, email, custom_fields=None, utm_source=None,
                       send_welcome=True, automation_ids=None):
        data = {
            "email": email,
            "send_welcome_email": send_welcome,
            "reactivate_existing": False
        }
        if custom_fields:
            data["custom_fields"] = custom_fields
        if utm_source:
            data["utm_source"] = utm_source
        if automation_ids:
            data["automation_ids"] = automation_ids
        return self._post("/subscriptions", data)

    def get_subscriber_by_email(self, email):
        from urllib.parse import quote
        return self._get(f"/subscriptions/by_email/{quote(email)}")

    def list_subscribers(self, limit=50, cursor=None, status="active"):
        params = {"limit": limit, "status": status}
        if cursor:
            params["cursor"] = cursor
        return self._get("/subscriptions", params)

    def list_all_subscribers(self, status="active"):
        """Paginate through all subscribers using cursor-based pagination."""
        all_subs = []
        cursor = None
        while True:
            result = self.list_subscribers(limit=100, cursor=cursor, status=status)
            all_subs.extend(result.get("data", []))
            if not result.get("has_more"):
                break
            cursor = result.get("next_cursor")
            time.sleep(0.1)  # Rate limit courtesy
        return all_subs

    def update_subscriber(self, subscription_id, custom_fields=None, tier=None):
        data = {}
        if custom_fields:
            data["custom_fields"] = custom_fields
        if tier:
            data["tier"] = tier
        return self._put(f"/subscriptions/{subscription_id}", data)

    def tag_subscriber(self, subscription_id, tags):
        return self._post(f"/subscriptions/{subscription_id}/tags", {"tags": tags})

    # --- Posts ---
    def list_posts(self, status="all", expand=None, limit=10):
        params = {"status": status, "limit": limit}
        if expand:
            params["expand"] = expand
        return self._get("/posts", params)

    def get_post(self, post_id, expand=None):
        params = {"expand": expand} if expand else {}
        return self._get(f"/posts/{post_id}", params)

    def create_post(self, title, body_html, subject=None, preview_text=None,
                    scheduled_at=None, template_id=None):
        """Enterprise only. Creates a draft post."""
        data = {
            "title": title,
            "body_content": body_html,
            "status": "draft"
        }
        if subject:
            data["email_settings"] = {"subject": subject}
            if preview_text:
                data["email_settings"]["preview_text"] = preview_text
        if scheduled_at:
            data["scheduled_at"] = scheduled_at
        if template_id:
            data["post_template_id"] = template_id
        return self._post("/posts", data)

    # --- Segments ---
    def list_segments(self, expand=None):
        params = {"expand": expand} if expand else {}
        return self._get("/segments", params)

    # --- Webhooks ---
    def create_webhook(self, url, event_types, description=None):
        data = {"url": url, "event_types": event_types}
        if description:
            data["description"] = description
        return self._post("/webhooks", data)

    def list_webhooks(self):
        return self._get("/webhooks")


# Usage example:
# client = BeehiivClient()
# client.add_subscriber("neil@example.com", custom_fields=[{"name": "town", "value": "Narragansett"}])
# posts = client.list_posts(status="confirmed", expand="stats")
```

---

## Google Sheets Content Pipeline

A practical pattern for weekly newsletter content management:

### Sheet Structure: "This Week's Content"
| Column | Field | Example |
|--------|-------|---------|
| A | Section | lineup |
| B | Category | music |
| C | Event Name | Roots & Blues Night |
| D | Date | Friday, March 20 |
| E | Time | 8:00 PM |
| F | Venue | The Ocean Mist |
| G | Town | Matunuck |
| H | Description | Three-piece blues band... |
| I | Link | https://... |
| J | Sponsored | FALSE |

### Sheet Structure: "Ad Inventory"
| Column | Field |
|--------|-------|
| A | Week Of |
| B | Headliner Sponsor |
| C | Headliner Rate |
| D | Mid-Ad Sponsor |
| E | Mid-Ad Rate |
| F | Spotlight Sponsor |
| G | Spotlight Rate |
| H | Deal Sponsor |
| I | Deal Rate |
| J | Footer Sponsor |
| K | Footer Rate |
| L | Total Revenue |

### Sheet Structure: "Analytics Log"
| Column | Field |
|--------|-------|
| A | Issue # |
| B | Send Date |
| C | Subscribers at Send |
| D | Open Rate |
| E | Click Rate |
| F | New Subscribers This Week |
| G | Unsubscribes |
| H | Revenue |
| I | Top Clicked Link |

---

## Deployment Options for Custom Integrations

| Option | Best For | Cost | Complexity |
|--------|----------|------|------------|
| Make.com | No-code, most use cases | Free-$29/mo | Low |
| Zapier | Simple triggers/actions | Free-$29/mo | Low |
| Vercel Functions | Webhook receivers, light scripts | Free tier | Medium |
| Railway | Full Node.js/Python apps | $5/mo | Medium |
| AWS Lambda | Event-driven, scalable | Pay-per-use | High |
| Self-hosted (VPS) | Full control | $5-20/mo | High |

For the South County Signal at launch, Make.com + Google Sheets is the recommended stack. Move to custom code only when you need capabilities Make can't handle.
