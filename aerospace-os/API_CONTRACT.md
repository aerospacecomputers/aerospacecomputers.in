# Service Request API Contract — Phase 1

POST /api/service-requests
GET /api/service-requests
GET /api/service-requests/:id
PATCH /api/service-requests/:id
POST /api/service-requests/:id/offer
POST /api/service-requests/:id/accept
POST /api/service-requests/:id/reject
POST /api/service-requests/:id/request-change
POST /api/service-requests/:id/ticket
GET /api/tickets
GET /api/tickets/:id
POST /api/tickets/:id/assign-engineer

Core entities:
Customer, CustomerUser, CustomerSite, ServiceRequest, Quote, QuoteLineItem, Approval, Ticket, EngineerAssignment, Attachment, StatusHistory.

Acceptance must store: user, timestamp, quote/version, proposed slot and approved amount.
