# Aerospace OS — Service Request MVP + Website Consultation Integration

## Demo workflow
Website aerospacecomputers.in consultation form → Aerospace OS Service Request → Admin review → availability + charges → customer approval → ticket.

## Included
- Website Consultation preview matching the live site's consultation fields
- Customer service request form
- Admin Service Requests queue
- Request detail + quote editor
- Labour / material / travel / other / GST calculations
- Availability + proposed date/time
- Customer offer/approval preview
- Accept → automatic Ticket ID
- Reject → request remains rejected
- Dashboard KPIs
- Demo API: POST/GET `/api/service-requests`

## Important
The live public website is not modified by this ZIP. The `Website Consultation` screen demonstrates the integration target. To connect the production form, point its submit handler to the Aerospace OS API and pass `source: "website"`.

## Run
```bash
npm install
npm run dev
```
