# Email Response User-Turn Template

Used by n8n's Code node to build the `messages` array sent to Claude.

---

Customer email from: {{from_address}}
Subject: {{subject}}

{{incoming_body}}

---

Please draft a reply to this customer email following your brand voice guidelines.
Return only the JSON object as specified in your instructions.
