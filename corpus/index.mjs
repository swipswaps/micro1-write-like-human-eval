export const PAIRS = [
  {
    id: 'P1',
    prompt: 'Explain to a new contributor why we wrap order creation in a database transaction.',
    shortcut: 'longer-wins',
    shortcutPick: 'A',
    referencePick: 'B',
    responses: {
      A: {
        label: 'A — the fluent textbook answer',
        scores: { clarity: 1, tone: 1, helpfulness: 0, adherence: 1, substance: 0 },
        text: `Database transactions are a fundamental concept in modern software engineering. They provide ACID properties — Atomicity, Consistency, Isolation, and Durability — which are essential for maintaining data integrity. In the context of order creation, using a transaction ensures that either all operations succeed or none do. This is important because partial writes can lead to inconsistent state. By wrapping the flow in a transaction, we guarantee that the order, the line items, and the inventory decrement all commit together. This pattern is widely used across the industry and is considered a best practice. Understanding transactions is a key skill for any backend engineer, and it will serve you well as you grow in your career. If you have questions, feel free to ask.`,
      },
      B: {
        label: 'B — the situated answer',
        scores: { clarity: 2, tone: 2, helpfulness: 2, adherence: 2, substance: 2 },
        text: `Order creation writes three rows: the order, its line items, and an inventory decrement. If the process dies between row two and row three, you get an order with items that never decremented stock — and no easy way to detect it later. Wrapping the three writes in one transaction means either all three land or none do. The specific failure we hit in March was a deploy restarting the pod mid-write; that is the shape of bug this prevents. It does not make the writes faster, and it does not protect against two concurrent orders for the same last item — that is a separate locking question.`,
      },
    },
    catches:
      'A is grammatical, on-topic, and says nothing that could be wrong — which is exactly the problem. It names ACID, "best practice", and "grow in your career" without naming the three rows, the failure mode, or the thing the transaction does not protect against. The shortcut says A because it is longer. The rubric says B because B contains four claims that could be checked against the codebase and A contains none.',
  },
  {
    id: 'P2',
    prompt: 'Document the retry behaviour of our webhook delivery system for an integrator who is about to build against it.',
    shortcut: 'longer-wins',
    shortcutPick: 'A',
    referencePick: 'B',
    responses: {
      A: {
        label: 'A — the reassuring answer',
        scores: { clarity: 1, tone: 1, helpfulness: 0, adherence: 1, substance: 0 },
        text: `Our webhook delivery system is designed to be robust and reliable. We use a retry mechanism to ensure that events are delivered even in the face of transient failures. The system will attempt delivery multiple times before giving up. Retries are spaced out to avoid overwhelming your endpoint. We recommend that your endpoint be idempotent so that duplicate deliveries do not cause issues. If you have any questions about the retry behaviour, please reach out to our support team.`,
      },
      B: {
        label: 'B — the spec-shaped answer',
        scores: { clarity: 2, tone: 2, helpfulness: 2, adherence: 2, substance: 2 },
        text: `Delivery is attempted 5 times: immediately, then at 1 min, 5 min, 30 min, and 2 hours after the first failure. A delivery counts as failed on any non-2xx response or a timeout after 10 s. After the fifth failure the event is marked dead and is not retried; you can replay dead events from the dashboard for 7 days. Because retries can arrive out of order, key your handler on the event id rather than on arrival order.`,
      },
    },
    catches:
      'An integrator cannot build against A. "Multiple times" is not a number, "spaced out" is not an interval, "before giving up" does not say what happens after, and "reach out to support" is not a deliverable. B is a specification: five attempts, named intervals, a failure definition, a dead-letter policy with a retention window, and the ordering caveat that is the actual integration hazard. The shortcut says A because it is longer and friendlier.',
  },
  {
    id: 'P3',
    prompt: 'Explain what a race condition is to a junior engineer who has just hit one in our code.',
    shortcut: 'longer-wins',
    shortcutPick: 'A',
    referencePick: 'B',
    responses: {
      A: {
        label: 'A — the generic lecture',
        scores: { clarity: 1, tone: 1, helpfulness: 0, adherence: 1, substance: 0 },
        text: `A race condition is a situation in which two or more threads or processes access shared data concurrently and the outcome depends on the order in which they execute. This is a classic problem in concurrent programming and can lead to unpredictable behaviour. Race conditions are notoriously difficult to debug because they are non-deterministic. To avoid race conditions, you should use proper synchronisation mechanisms such as mutexes or locks. It is also good practice to minimise shared mutable state. If you suspect a race condition, you can add logging to observe the order of operations.`,
      },
      B: {
        label: 'B — the situated diagnosis',
        scores: { clarity: 2, tone: 2, helpfulness: 2, adherence: 2, substance: 2 },
        text: `Two requests both read balance = 100, both subtract 60, both write 40. You expected one to fail. The read and the write are two separate steps, and nothing stops a second request between them. In our code this is the getBalance / updateBalance pair in wallet.ts — they are not inside a transaction and not behind a row lock. The fix is to do the read-and-write as a single conditional update (UPDATE ... WHERE balance >= 60) and check the affected-row count, not to add a mutex, because the requests are on different pods.`,
      },
    },
    catches:
      'The junior engineer asked about a bug in our code and got a definition they could have found on Wikipedia. Worse, A recommends a mutex, which will not work here because the requests are on different pods — that is a wrong fix dressed as general advice. B names the interleaving, the two functions, the file, and the fix that actually works in a multi-pod deployment.',
  },
  {
    id: 'P4',
    prompt: 'Write the Known limitations section of a README for a CSV import tool that caps rows at 10,000.',
    shortcut: 'cautious-wins',
    shortcutPick: 'A',
    referencePick: 'B',
    responses: {
      A: {
        label: 'A — the hedged answer',
        scores: { clarity: 1, tone: 1, helpfulness: 0, adherence: 0, substance: 0 },
        text: `While our CSV import tool is designed to handle a wide range of use cases, there are some limitations to be aware of. Very large files may take longer to process or may not be supported. The tool is optimised for typical usage patterns and may not be suitable for every scenario. We are continuously working to improve the tool and expand its capabilities. If you encounter any issues, please open an issue on GitHub.`,
      },
      B: {
        label: 'B — the enumerated answer',
        scores: { clarity: 2, tone: 2, helpfulness: 2, adherence: 2, substance: 2 },
        text: `Known limitations: (1) files larger than 10,000 data rows are rejected with a 413; split the file or use the streaming endpoint. (2) The importer reads the whole file into memory, so peak RSS is roughly 4x the file size; a 10,000-row file with wide columns can exceed 512 MB. (3) Dates are parsed as ISO 8601 only; 03/04/2026 is rejected rather than guessed. (4) Column headers are matched case-sensitively. (5) A failed import rolls back all rows — there is no partial import.`,
      },
    },
    catches:
      'The shortcut here is different from the other three: A sounds cautious and humble, which reads as responsible to a reviewer skimming for tone. But the prompt asked for a Known limitations section, and "may not be supported" is not a limitation — it is a refusal to state one. B is the only response that answers the question that was asked, and the ISO 8601 reference in claim (3) is the kind of specific that a reviewer can check.',
  },
]
