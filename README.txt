MICRO1 WRITE-LIKE-HUMAN EVAL
============================

A pairwise rubric for evaluating AI-generated technical writing on five
dimensions: clarity, tone, helpfulness, adherence to instructions, and
substance. The unit of evaluation is a (prompt, pair of responses) triple,
not a solution.

THE POSTING
-----------

micro1's Technical Writer/Editor role asks for a Write-like-Human Eval:
"compare model-generated responses to writing prompts, offering analytical
quality scores and detailed rationales". The scope names clarity, tone,
helpfulness, and adherence to instructions. The must-haves are "demonstrated
experience in technical writing, editing, or content evaluation" and "strong
ability to judge clarity, tone, coherence, and usefulness in technical and
instructional content".

https://jobs.micro1.ai/post/6deb983c-1ae8-4576-8b85-a80802fdeeb4

THE ARGUMENT
------------

Fluency is not quality. A response can be grammatical, on-topic, friendly,
and contain no information. The sibling Content Writer & Editor posting names
this "AI slop" and asks for it to be detected. The fifth dimension here,
substance, is the one that catches it.

The rubric scores each response 0-2 on five dimensions, weighted:

  substance     0.30   would each claim survive a fact-check
  helpfulness   0.25   can the reader act on it without a follow-up
  clarity       0.20   does the reader know what to do next
  adherence     0.15   did it answer the prompt that was asked
  tone          0.10   does the register match the named reader

Each response falls into a band by weighted total:

  publishable   total >= 1.70
  needs-edit    1.00 <= total < 1.70
  ai-slop       total < 1.00

The discrimination matrix shows that the rubric rejects the shortcut verdict
on every pair where the shortcut is wrong.

THE FOUR PAIRS
--------------

P1  Explain a database transaction to a new contributor
    Shortcut (longer wins): A. Rubric: B. A names ACID and "best practice"
    and never names the three rows or the failure mode. B names both.

P2  Document webhook retry behaviour for an integrator
    Shortcut (longer wins): A. Rubric: B. A says "multiple times" and
    "spaced out". B says five attempts, named intervals, dead-letter policy,
    and the out-of-order caveat.

P3  Explain a race condition to a junior who just hit one
    Shortcut (longer wins): A. Rubric: B. A defines the term and recommends
    a mutex, which does not work across pods. B names the interleaving, the
    two functions, the file, and the fix that works.

P4  Write a Known limitations section
    Shortcut (cautious wins): A. Rubric: B. A hedges and states no
    limitation. B enumerates five, including the ISO 8601 date constraint.

RUN IT
------

    npm ci
    npm run review
    npm run build
    npm run preview

The review script writes src/generated/matrix.json for the app and
public/matrix.json for direct download.

TEST IT
-------

    npx playwright install chromium
    npx playwright test

Visual baselines must be generated inside the pinned Playwright image.
The verify workflow runs in mcr.microsoft.com/playwright, version pinned by
the scaffold script to match @playwright/test.

CITATIONS
---------

Google Technical Writing course — clarity as actionability
    https://developers.google.com/tech-writing
Google developer documentation style guide — conversational, not casual
    https://developers.google.com/style
Microsoft Writing Style Guide — actionability over completeness
    https://learn.microsoft.com/en-us/style-guide/welcome/
Diataxis — tutorial / how-to / reference / explanation
    https://diataxis.fr/
ISO 8601 — date and time format
    https://www.iso.org/iso-8601-date-and-time-format.html

KNOWN LIMITS
------------

- Four pairs is a demonstration of the rubric, not a benchmark.
- The scores are authored, not measured. A production version needs
  inter-rater agreement data and a calibration pass against a second
  reviewer.
- The band thresholds and the dimension weights are choices, stated so they
  can be argued with.
- The responses are representative of the class, not captured from a live
  model. No prompt-and-capture harness is included.
- Only English is evaluated. The posting requires native-level English
  fluency; it does not evaluate other languages, and neither does this rubric.
- The live micro1 Technical Writer/Editor requisition is currently closed.
  This artefact is built for the next opening and for the talent-network
  screen.
