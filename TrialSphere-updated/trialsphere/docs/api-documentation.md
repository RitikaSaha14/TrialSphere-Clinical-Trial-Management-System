# API documentation

Base URL: `http://localhost:4000/api`

## GET /health
Returns API health status.

## GET /dashboard/stats
Returns portfolio KPI values, enrollment trend series and study status distribution.

## GET /studies?q=&status=
Returns studies. `q` matches title/protocol code; status accepts `All`, `Recruiting`, `Active`, `Planning`, `Completed`, `On Hold`.

## GET /studies/:id
Returns one study including participant and milestone records.

## POST /studies
Example JSON:
```json
{
  "protocolCode": "TS-ENDO-021",
  "title": "Endocrine Health Research",
  "phase": "Phase II",
  "status": "Planning",
  "targetEnrollment": 160,
  "startDate": "2026-11-15T00:00:00.000Z"
}
```

## GET /sites
Returns trial site directory.

## GET /participants
Returns synthetic participant codes with associated study title and site.
