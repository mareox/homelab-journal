# Resume Bot Experience v2 — Publication Evidence

Status: ready

This is a sanitized planning pack, not a published journal post. Experience v2
is live, behavior-verified, and now passes the fixed production latency gate.
No private corpus, visitor transcript, token, internal address, or host path is
included here.

## Release record

| Layer | Verified release |
| --- | --- |
| Frontend | `b05e5a72ea4188cbdc5d4cd82e434d803bf1d787` |
| GitHub Pages workflow | `32425676417` — success |
| Backend | `c6504cc51812c68070d500097216d1ecbc1dbf1a` |
| Active Atlas release | `c6504cc51812c68070d500097216d1ecbc1dbf1a` |
| Rollback release | `9101b52fe5b90e77a0986932dda37c81d7aa5af8` |

## Automated gates

| Gate | Command | Result | Evidence summary |
| --- | --- | --- | --- |
| Backend tests | `uv run pytest -q` | PASS | 118 tests |
| Backend lint and types | `uv run ruff check .` and `uv run mypy app tests scripts` | PASS | Ruff and mypy |
| Deterministic evaluation | `uv run python scripts/evaluate.py` against the local fake server | PASS | 41 of 41; metadata-only result |
| Frontend application suite | `npx playwright test tests/resume-bot.spec.js` | PASS | 64 desktop/mobile checks; axe and stale Turnstile callback races included |
| Production-only suite | `RUN_PRODUCTION_E2E=1 npx playwright test tests/resume-bot.production.spec.js --project=chromium --headed --workers=1` | NOT PROVEN | Eight opt-in cases; headed Chromium could not obtain a Turnstile token within its allowance |
| Secret scan | `gitleaks protect --staged --redact` | PASS | Pinned scanner, redacted output |
| PNG metadata | `exiftool -q -q -s -s -s -EXIF:all -XMP:all -IPTC:all -PNG:TextualData *.png` | PASS | Zero selected tag values returned |
| Atlas health/readiness | `curl $RESUME_BOT_HEALTH_BASE/health/live` and `/health/ready` | PASS | Live and ready |
| Public Caddy boundary | `curl` invalid-token fixture to the public API | PASS | Typed refusal through DNS/Caddy |
| Fixed production latency | `python3 benchmarks/summarize_experience_runs.py compare --max-p95-ratio 1.20` | PASS | Normal-browser p95 ratio 0.340; maximum allowed 1.200 |

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
| Five fixed latency prompts after verification prewarm | PASS | 2026-08-20T23:01:55Z |

## Latency comparison

| Distribution | p50 | p95 |
| --- | ---: | ---: |
| Baseline | 16.604 s | 17.823 s |
| Initial post-deploy | 15.733 s | 40.553 s |
| Verification-prewarm release | 5.026 s | 6.054 s |

The remediated p95 ratio is 0.340. The fixed acceptance ceiling is 1.200, so the
gate passes. The normal Brave session used the same five public case IDs and
retained only pass/fail and elapsed milliseconds. The frontend now preconnects
to Cloudflare, keeps one widget mounted during normal use, and prewarms the next
one-time token; Atlas still validates every token server-side. Stop, Clear,
timeout, error, and expiry paths invalidate the widget generation so a late
callback cannot poison a later request.

Headed Playwright still could not obtain a managed Turnstile token within its
allowance and has no bypass. That honest automation limitation is retained
separately from the successful normal-browser result.

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

Decision: READY FOR PUBLICATION.

Reviewer: Codex execution session, 2026-08-20.

Closed blockers:

1. The fixed five-case normal-browser p95 is 6.054 seconds, below the 21.388
   second ceiling.
2. Durable wiki provenance is recorded in the August closeout journal.

A separate journal workflow may now turn this planning pack into a public post.
This rollout does not ingest the public homelab journal into the bot's knowledge
base.
