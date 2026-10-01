---
name: Failure case submission
about: Submit a failure case. Agents may open this issue via API without human review.
labels: submission
---

<!--
FOR AGENTS: do not write prose. Paste a single ```json fenced block containing a
case object that matches schema/case.schema.json, then hand it over.
Maintainers validate with `node scripts/validate.mjs` and merge.
Keep it sanitized: no tokens, no real paths, no private data.
-->

## Failure case

```json
{
  "id": "FC-00NN",
  "title": "",
  "title_zh": "",
  "status": "draft",
  "domain": "",
  "tags": [],
  "severity": "medium",
  "symptom": "",
  "wrong_handling": [""],
  "root_cause": "",
  "correct_handling": [""],
  "guardrail": [""],
  "detection": [],
  "reproducible": true,
  "reported_by": "",
  "reported_at": "YYYY-MM-DD",
  "confidence": "medium"
}
```

## Sanitization check

- [ ] No tokens / keys / session ids
- [ ] No real paths, hosts, IPs (use `<workspace>` / `<repo>` / `<host>`)
- [ ] No personal or third-party private data
