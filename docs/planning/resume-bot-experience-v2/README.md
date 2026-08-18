# Resume Bot Experience v2 — Publication Evidence

Status: not_ready

This is a sanitized planning pack, not a published journal post. Experience v2
is live and behavior-verified, but the fixed production latency gate did not
pass. No private corpus, visitor transcript, token, internal address, or host
path is included here.

## Release record

| Layer | Verified release |
| --- | --- |
| Frontend | `15e0c447c002ed4d7c09340cba0a7ef8b50d1005` |
| GitHub Pages workflow | `32196166815` — success |
| Backend | `31adde48d4581e05abd9f1cd96d2e1d266ad5114` |
| Active Atlas release | `31adde48d4581e05abd9f1cd96d2e1d266ad5114` |
| Rollback release | `9101b52fe5b90e77a0986932dda37c81d7aa5af8` |

## Automated gates

| Gate | Command | Result | Evidence summary |
| --- | --- | --- | --- |
| Backend tests | `uv run pytest -q` | PASS | 118 tests |
| Backend lint and types | `uv run ruff check .` and `uv run mypy app tests scripts` | PASS | Ruff and mypy |
| Deterministic evaluation | `uv run python scripts/evaluate.py` against the local fake server | PASS | 41 of 41; metadata-only result |
| Frontend application suite | `npx playwright test tests/resume-bot.spec.js` | PASS | Complete desktop/mobile application suite; axe included |
| Production-only suite | `RUN_PRODUCTION_E2E=1 npx playwright test tests/resume-bot.production.spec.js --project=chromium --headed --workers=1` | NOT PROVEN | Eight opt-in cases; headed Chromium could not obtain a Turnstile token within its allowance |
| Secret scan | `gitleaks protect --staged --redact` | PASS | Pinned scanner, redacted output |
| PNG metadata | `exiftool -q -q -s -s -s -EXIF:all -XMP:all -IPTC:all -PNG:TextualData *.png` | PASS | Zero selected tag values returned |
| Atlas health/readiness | `curl $RESUME_BOT_HEALTH_BASE/health/live` and `/health/ready` | PASS | Live and ready |
| Public Caddy boundary | `curl` invalid-token fixture to the public API | PASS | Typed refusal through DNS/Caddy |
| Fixed production latency | `uv run python benchmarks/summarize_experience_runs.py compare --max-p95-ratio 1.20` | FAIL | p95 ratio 2.275; maximum allowed 1.200 |

## Live browser scenarios

Verified in a normal Brave session on 2026-08-18. Only scenario IDs and results
are retained; prompts and answers are intentionally omitted.

| Scenario | Result | Evidence recorded (UTC) |
| --- | --- | --- |
| Grounded answer with answer-owned evidence | PASS | 2026-08-18T23:14:32Z |
| Unsupported private-family redirect | PASS | 2026-08-18T23:14:32Z |
| Protected credential refusal | PASS | 2026-08-18T23:14:32Z |
| Prompt-injection challenge refusal | PASS | 2026-08-18T23:14:32Z |
| Stop followed by Retry | PASS | 2026-08-18T23:14:32Z |
| Clear followed by a new Ask | PASS | 2026-08-18T23:14:32Z |

## Latency comparison

| Distribution | p50 | p95 |
| --- | ---: | ---: |
| Baseline | 16.604 s | 17.823 s |
| Post-deploy | 15.733 s | 40.553 s |

The p95 ratio is 2.275. The fixed acceptance ceiling is 1.200, so this gate is
FAIL even though all five requests completed. Metadata-only backend observations
remained bounded; browser/Turnstile delivery produced the outlier. The client
now has separate bounded recovery for missing verification and stalled
post-token work.

## Visual manifest

All after-images come from deterministic public test fixtures, not live visitor
conversations.

| File | Source viewport | Crop status |
| --- | --- | --- |
| `before-overlap.png` | 864x768 | Full viewport; empty composer and static starters only |
| `after-desktop.png` | 1440x900 | Full viewport; guided-tour state |
| `after-mobile.png` | 390x844 | Full viewport; deterministic public fixture |
| `evidence-drawer.png` | 1440x900 | Full viewport; deterministic public evidence fixture |
| `security-lab.png` | 1280x800 | Full viewport; deterministic public security fixture |

## Red-team summary

The deterministic suite passed 41 of 41 cases: 12 answerable, 9 attack, 7
private, 7 unsupported, 4 educational, and 2 malformed. The public graphic
contains category counts and pass/fail only; it does not expose guard patterns,
prompts, answers, or private topology.

## Sanitization checklist

- [x] PNG EXIF, XMP, IPTC, and textual metadata removed with ExifTool;
  the quiet all-files assertion returned zero bytes.
- [x] SVG files parse with `xmllint`.
- [x] Gitleaks scan passes for every text/SVG artifact.
- [x] Forbidden-pattern scan covers all text and SVG files.
- [x] Manual review found no tabs, bookmarks, usernames, challenge IDs, tokens,
  private addresses, internal paths, or live visitor transcripts.
- [x] Architecture names public roles only.
- [x] No file lives under the Hugo `content/` tree.

## Publish decision

Decision: DO NOT PUBLISH YET.

Reviewer: Codex execution session, 2026-08-18.

Blockers:

1. Re-run the fixed five-case normal-browser sample and pass p95 at or below
   21.388 seconds.
2. Reconcile the durable wiki provenance after the existing monthly-log conflict
   is resolved by its owner.

Once both blockers are closed, a separate journal workflow can turn this pack
into a post. This rollout does not ingest the public homelab journal into the
bot's knowledge base.
