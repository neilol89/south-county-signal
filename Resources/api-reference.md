# Beehiiv API v2 Reference

Base URL: `https://api.beehiiv.com/v2`

All endpoints require Bearer token authentication:
```
Authorization: Bearer {API_KEY}
Content-Type: application/json
```

## Table of Contents
1. [Publications](#publications)
2. [Subscriptions](#subscriptions)
3. [Posts](#posts)
4. [Post Templates](#post-templates)
5. [Segments](#segments)
6. [Custom Fields](#custom-fields)
7. [Webhooks](#webhooks)
8. [Automations & Journeys](#automations--journeys)
9. [Bulk Operations](#bulk-operations)
10. [Subscription Tags](#subscription-tags)
11. [Referral Program](#referral-program)
12. [Pagination](#pagination)
13. [Error Handling](#error-handling)

---

## Publications

### List Publications
```
GET /v2/publications
```
**Query Params:**
- `expand` (optional): `stats`, `subscription_count`, `active_subscription_count`, `free_subscription_count`, `premium_subscription_count`, `email_open_rate`, `email_click_rate`, `total_posts`
- `limit` (1-100, default: 10)
- `page` (default: 1)
- `order_by`: `created` | `name`
- `direction`: `asc` | `desc`

**Response:**
```json
{
  "data": [
    {
      "id": "pub_XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
      "name": "The South County Signal",
      "description": "Your weekly cheat sheet for Southern RI",
      "url": "https://southcountysignal.beehiiv.com",
      "created_at": 1710000000
    }
  ],
  "limit": 10,
  "page": 1,
  "total_results": 1
}
```

### Get Single Publication
```
GET /v2/publications/{publicationId}
```

---

## Subscriptions

### Create Subscription
```
POST /v2/publications/{publicationId}/subscriptions
```
**Body:**
```json
{
  "email": "subscriber@example.com",
  "reactivate_existing": false,
  "send_welcome_email": true,
  "utm_source": "website",
  "utm_medium": "organic",
  "utm_campaign": "launch",
  "referring_site": "https://southcountysignal.com",
  "referral_code": "sub_XXXXX",
  "custom_fields": [
    { "name": "first_name", "value": "Jane" },
    { "name": "town", "value": "Narragansett" }
  ],
  "double_opt_in_override": "on",
  "automation_ids": ["aut_XXXXX"]
}
```
**Notes:**
- `custom_fields` must already exist in the publication dashboard
- `referral_code` gives credit to an existing subscriber for referring
- `automation_ids` enrolls the new subscriber into specified automations (automations must have "Add by API" trigger active)

### List Subscriptions
```
GET /v2/publications/{publicationId}/subscriptions
```
**Query Params:**
- `expand`: `subscription_premium_tiers`, `referrals`, `stats`, `custom_fields`, `tags`
- `email` (optional): exact match, case insensitive
- `status`: `active` | `inactive` | `all` (default: all)
- `tier`: `free` | `premium` | `all`
- `limit` (1-100, default: 10)
- `cursor` (recommended) or `page` (deprecated, max 100 pages)
- `order_by`: `created`
- `direction`: `asc` | `desc`
- `created_after` (format: YYYY/MM/DD)

**Response (cursor-based):**
```json
{
  "data": [
    {
      "id": "sub_XXXXXXXX",
      "email": "user@example.com",
      "status": "active",
      "created_at": 1710000000,
      "subscription_premium_tiers": [],
      "utm_source": "website",
      "referral_code": "sub_XXXXX"
    }
  ],
  "limit": 10,
  "has_more": true,
  "next_cursor": "cursor_value"
}
```

### Get Subscription by Email
```
GET /v2/publications/{publicationId}/subscriptions/by_email/{email}
```
**Note:** Email must be URL-encoded.

### Get Subscription by ID
```
GET /v2/publications/{publicationId}/subscriptions/{subscriptionId}
```

### Update Subscription
```
PUT /v2/publications/{publicationId}/subscriptions/{subscriptionId}
```
**Body:**
```json
{
  "tier": "free|premium",
  "custom_fields": [
    { "name": "town", "value": "Westerly" }
  ],
  "unsubscribe": false
}
```

### Delete Subscription
```
DELETE /v2/publications/{publicationId}/subscriptions/{subscriptionId}
```

---

## Posts

### List Posts
```
GET /v2/publications/{publicationId}/posts
```
**Query Params:**
- `expand`: `stats`, `free_web_content`, `free_email_content`, `free_rss_content`, `premium_web_content`, `premium_email_content`
- `status`: `draft` | `confirmed` | `archived` | `all`
- `platform`: `web` | `email` | `both` | `all`
- `content_tags`: array of tag strings
- `slugs`: array of slug strings
- `authors`: array of author names (case-insensitive)
- `limit`, `page`, `order_by`, `direction`

**Response (with stats):**
```json
{
  "data": [
    {
      "id": "post_XXXXXXXX",
      "title": "Issue #12 — Summer Kickoff",
      "subtitle": "The South County Signal",
      "slug": "issue-12-summer-kickoff",
      "status": "confirmed",
      "publish_date": 1718000000,
      "displayed_date": 1718000000,
      "thumbnail_url": "https://...",
      "web_url": "https://southcountysignal.beehiiv.com/p/issue-12",
      "stats": {
        "email": {
          "recipients": 5200,
          "opens": 2860,
          "unique_opens": 2340,
          "clicks": 780,
          "unique_clicks": 520
        },
        "web": {
          "views": 1200
        }
      }
    }
  ]
}
```

### Get Single Post
```
GET /v2/publications/{publicationId}/posts/{postId}
```

### Create Post (Enterprise Beta Only)
```
POST /v2/publications/{publicationId}/posts
```
**Body:**
```json
{
  "title": "Issue #15 — Beach Season is Here",
  "subtitle": "The South County Signal",
  "body_content": "<div>Raw HTML content here...</div>",
  "post_template_id": "post_template_XXXXX",
  "status": "draft",
  "scheduled_at": "2026-03-19T11:00:00Z",
  "displayed_date": "2026-03-19",
  "thumbnail_url": "https://...",
  "social_share_type": "with_comments_and_likes",
  "recipients": {
    "segment_ids": ["seg_XXXXX"],
    "exclude_segment_ids": []
  },
  "email_settings": {
    "subject": "This Week's Move: Live Music at The Mist 🎵",
    "preview_text": "Plus 7 more events, a killer deal, and the best lobster roll debate"
  },
  "web_settings": {
    "is_published": true
  },
  "metadata": {
    "content_tags": ["weekly-roundup", "march-2026"]
  }
}
```
**Alternative: Use `blocks` instead of `body_content`:**
```json
{
  "blocks": [
    { "type": "heading", "content": "THIS WEEK'S MOVE" },
    { "type": "paragraph", "content": "Event description here..." },
    { "type": "button", "content": "Get Details →", "url": "https://..." }
  ]
}
```

### Update Post
```
PATCH /v2/publications/{publicationId}/posts/{postId}
```

### Delete Post
```
DELETE /v2/publications/{publicationId}/posts/{postId}
```

---

## Post Templates

### List Post Templates
```
GET /v2/publications/{publicationId}/post_templates
```

### Get Post Template
```
GET /v2/publications/{publicationId}/post_templates/{postTemplateId}
```

---

## Segments

### List Segments
```
GET /v2/publications/{publicationId}/segments
```
**Query Params:**
- `type`: `dynamic` | `manual` | `static` | `all`
- `status`: `pending` | `processing` | `completed` | `failed` | `all`
- `expand`: `stats` (recalculated daily ~7am UTC for dynamic)
- `limit`, `page`, `order_by`, `direction`

### Get Segment
```
GET /v2/publications/{publicationId}/segments/{segmentId}
```

### Get Segment Results (subscribers in segment)
```
GET /v2/publications/{publicationId}/segments/{segmentId}/results
```

---

## Custom Fields

### List Custom Fields
```
GET /v2/publications/{publicationId}/custom_fields
```

### Get Custom Field
```
GET /v2/publications/{publicationId}/custom_fields/{id}
```

**Note:** Custom fields must be created in the Beehiiv dashboard. The API can only read field definitions and set values on subscriptions.

Recommended custom fields for a local newsletter:
- `first_name` (text)
- `town` (text) — for geographic segmentation
- `interests` (text) — comma-separated: music, food, outdoor, nightlife, family, arts

---

## Webhooks

### Create Webhook
```
POST /v2/publications/{publicationId}/webhooks
```
**Body:**
```json
{
  "url": "https://your-server.com/webhooks/beehiiv",
  "event_types": [
    "subscription.created",
    "subscription.deleted",
    "post.sent"
  ],
  "description": "South County Signal webhook"
}
```

### List Webhooks
```
GET /v2/publications/{publicationId}/webhooks
```

### Delete Webhook
```
DELETE /v2/publications/{publicationId}/webhooks/{webhookId}
```

### Webhook Payloads

**subscription.created:**
```json
{
  "event_type": "subscription.created",
  "event_timestamp": 1710000000,
  "uid": "evt_XXXXX",
  "data": {
    "id": "sub_XXXXX",
    "email": "user@example.com",
    "status": "active",
    "created_at": 1710000000,
    "utm_source": "website"
  }
}
```

**post.sent:**
```json
{
  "event_type": "post.sent",
  "event_timestamp": 1710000000,
  "uid": "evt_XXXXX",
  "data": {
    "id": "post_XXXXX",
    "title": "Issue #12",
    "status": "confirmed",
    "publish_date": 1710000000
  }
}
```

---

## Automations & Journeys

### Add Subscription to Automation
```
POST /v2/publications/{publicationId}/automations/{automationId}/journeys
```
**Body:**
```json
{
  "email": "user@example.com",
  "double_opt_in_override": "off"
}
```
**Note:** Automation must have an active "Add by API" trigger.

---

## Bulk Operations

### Bulk Create Subscriptions
```
POST /v2/publications/{publicationId}/bulk_subscriptions
```
**Body:**
```json
{
  "subscriptions": [
    { "email": "user1@example.com", "custom_fields": [{ "name": "town", "value": "Narragansett" }] },
    { "email": "user2@example.com", "custom_fields": [{ "name": "town", "value": "Westerly" }] }
  ],
  "send_welcome_email": false
}
```

### Bulk Update Subscriptions
```
POST /v2/publications/{publicationId}/bulk_subscription_updates
```

---

## Subscription Tags

### Add Tags
```
POST /v2/publications/{publicationId}/subscriptions/{subscriptionId}/tags
```
**Body:**
```json
{
  "tags": ["south-county", "music-lover", "weekly-reader"]
}
```

### Remove Tags
```
DELETE /v2/publications/{publicationId}/subscriptions/{subscriptionId}/tags
```

---

## Referral Program

### Get Referral Program
```
GET /v2/publications/{publicationId}/referral_program
```

---

## Pagination

**Cursor-based (recommended):**
```
GET /v2/publications/{pubId}/subscriptions?limit=50&cursor=next_cursor_value
```
Response includes `has_more` (boolean) and `next_cursor` (string).

**Offset-based (deprecated, max 100 pages):**
```
GET /v2/publications/{pubId}/subscriptions?limit=50&page=2
```
Response includes `page` and `total_pages`.

Always use cursor-based pagination for new integrations.

---

## Error Handling

Standard HTTP status codes:
- `200` — Success
- `201` — Created
- `400` — Bad request (check body)
- `401` — Unauthorized (check API key)
- `403` — Forbidden (check plan tier)
- `404` — Not found
- `422` — Unprocessable entity (validation error)
- `429` — Rate limited (back off and retry)
- `500` — Server error

Error response format:
```json
{
  "errors": [
    {
      "message": "Description of the error",
      "field": "email"
    }
  ]
}
```

### Rate Limiting
Beehiiv rate-limits API requests. When you receive a `429` response:
1. Read the `Retry-After` header if present
2. Implement exponential backoff
3. For bulk operations, batch and add 100-200ms delays between requests
