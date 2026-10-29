# AGENTS.md — Transaction Ledger API

## 1. Project Overview

This project is a Transaction Ledger API developed as a backend assessment.

The application must allow users to:

- Create accounts.
- Add credit and debit transactions.
- Retrieve account balances.
- Retrieve transaction history with filtering and pagination.
- Prevent duplicate transactions.
- Maintain accurate account balances.
- Optionally transfer money between accounts.

The code must be simple, readable, maintainable, and suitable for a real-world backend application.

## 2. Technology Stack

Use the following technologies:

- Node.js
- TypeScript
- Express.js
- MongoDB
- Mongoose

### Validation Rules

- Do not use Zod, Joi, Yup, or any other schema-validation library.
- Use plain TypeScript functions and classes for validation.
- Do not install unnecessary dependencies.
- Use existing project dependencies whenever possible.
- Before adding a new dependency, check whether the requirement can be implemented using the existing stack.

## 3. General Coding Principles

Follow these rules for every implementation:

- Prefer simple and readable code over clever or complicated code.
- Write code that another developer can understand without needing a lengthy explanation.
- Follow SOLID principles where they improve maintainability.
- Follow Clean Architecture without creating unnecessary layers.
- Avoid overengineering.
- Do not introduce abstractions without a clear purpose.
- Do not duplicate business logic.
- Do not create unnecessary classes, interfaces, helper functions, or files.
- Do not use design patterns just to make the code look more advanced.
- Keep functions focused on one clear responsibility.
- Use TypeScript types instead of unnecessary type assertions.
- Avoid `any`. Use proper types or `unknown` when the type is genuinely unknown.
- Avoid unnecessary comments that simply repeat what the code already says.
- Add comments when they explain important business rules or non-obvious decisions.
- Do not change unrelated files when implementing a feature.
- Do not silently change existing behavior without a clear requirement.

## 4. Function and Variable Naming

Use **normal, descriptive, conventional names** that clearly explain what the code does.

Prefer familiar naming conventions over clever, abbreviated, or unnecessarily abstract names.

### Function naming

Use `camelCase` for ordinary functions and methods.

Good examples:

```ts
function createAccount() {}

function findAccountById() {}

function validateTransactionAmount() {}

function calculateNewBalance() {}

function getTransactionHistory() {}

function transferMoney() {}
```

Avoid unclear or unnecessarily complicated names:

```ts
function process() {}

function executeOperation() {}

function handleData() {}

function performTransactionWorkflow() {}
```

Use names such as `createAccount`, `findAccountById`, and `calculateNewBalance` when they accurately describe the operation.

Do not use `PascalCase` for ordinary function names. Reserve `PascalCase` for classes, types, and interfaces.

### Variable naming

Use descriptive `camelCase` variable names.

Good examples:

```ts
const accountId = request.params.accountId;
const transactionAmount = request.body.amount;
const existingTransaction = await transactionRepository.findByReference(
  accountId,
  referenceId
);
```

Avoid unclear abbreviations:

```ts
const acc = request.params.accountId;
const tx = request.body.amount;
const res1 = await repository.findByReference(acc, tx);
```

Common abbreviations such as `id` are acceptable when their meaning is clear.

### Boolean naming

Use names that clearly communicate true or false:

```ts
const accountExists = true;
const hasSufficientBalance = false;
const isDuplicateTransaction = false;
```

Avoid vague names such as `check`, `flag`, or `status` when a more descriptive name is available.

### Class and interface naming

Use `PascalCase` for classes, interfaces, and types.

Examples:

```ts
class AccountService {}

interface AccountRepository {}

type TransactionType = 'credit' | 'debit';
```

Use a consistent naming convention throughout the project.

## 5. Avoid Confusing and Overcomplicated Code

Code must be understandable without navigating through many unnecessary layers.

Do not make straightforward operations unnecessarily complicated.

### Avoid unnecessary getters and setters

Do not create getters for every property automatically.

Use getters when they protect an important invariant, provide controlled access to private data, or are needed by the design.

Avoid creating several layers of getters just to access ordinary data.

### Avoid excessive static methods

Do not make every operation a static class method.

Use a normal function or instance method when it is clearer and more appropriate.

Use static methods when they provide a meaningful purpose, such as constructing a valid domain entity.

### Avoid unnecessary wrapper classes

Do not create a class around a simple operation unless the class provides meaningful behavior or responsibility.

For example, do not introduce a `Money` class merely to wrap a number if the project only needs straightforward amount validation and consistent rounding.

A `Money` value object is acceptable if it provides meaningful financial rules and is used consistently across the application. It must not introduce more confusion than value.

### Avoid unnecessary method chaining

Prefer readable operations over long chains of small methods when the chain makes the behavior difficult to understand.

### Avoid excessive indirection

A developer should be able to follow an important operation, such as creating a transaction, without jumping through many unrelated files.

Use the repository, use-case, and controller layers where they serve a clear architectural purpose. Do not create additional layers without a specific need.

### Avoid clever implementations

Prefer straightforward conditional statements and meaningful variable names.

Do not use complex expressions, nested ternary operators, or unnecessary abstractions when a simple `if` statement is clearer.

### Keep code consistent

Do not mix multiple approaches to solving the same problem without a reason.

For example, if the project uses plain validation functions, do not introduce a separate validation framework or a complicated validation class system for one endpoint.

Before adding a new abstraction, ask:

1. Does this solve a real problem?
2. Does it make the code easier to understand?
3. Is there already a simpler way to do it?
4. Will it be used consistently?

If the abstraction does not provide a meaningful benefit, do not add it.

## 6. Project Architecture

Use Clean Architecture with clear responsibilities.

Suggested structure:

```text
src/
├── domain/
│   ├── entities/
│   ├── errors/
│   └── repositories/
├── application/
│   └── use-cases/
├── infrastructure/
│   └── database/
│       ├── models/
│       └── repositories/
├── presentation/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   └── validators/
├── config/
├── app.ts
└── server.ts
```

Adapt this structure to the existing project. Do not reorganize the entire application unnecessarily just to match this example.

### Domain layer

Responsible for:

- Core business rules.
- Account and transaction entities.
- Domain errors.
- Repository interfaces when the chosen architecture places those contracts in the domain.

The domain must not depend on Express, HTTP requests, Mongoose models, or database-specific implementations.

### Application layer

Responsible for:

- Coordinating business operations.
- Creating accounts.
- Adding credit and debit transactions.
- Retrieving balances and transaction history.
- Coordinating transfers when implemented.

Use cases should depend on repository interfaces rather than concrete database implementations.

### Infrastructure layer

Responsible for:

- MongoDB connection.
- Mongoose schemas and models.
- Repository implementations.
- Database-specific operations.
- MongoDB sessions and transactions.

### Presentation layer

Responsible for:

- Express routes.
- Controllers.
- Request validation.
- HTTP status codes and response formatting.
- Error-handling middleware.

Controllers should remain thin. They should validate the HTTP boundary, call the appropriate use case, and return the response.

Do not put all business logic in controllers.

## 7. SOLID Principles

Apply SOLID when it improves the design.

- **Single Responsibility Principle:** Each class or function should have one clear responsibility.
- **Open/Closed Principle:** Extend behavior without unnecessarily modifying unrelated working code.
- **Liskov Substitution Principle:** Implementations of an interface must honor its expected behavior.
- **Interface Segregation Principle:** Keep interfaces focused on the operations their consumers need.
- **Dependency Inversion Principle:** High-level business logic should depend on abstractions rather than database-specific implementations.

Do not create interfaces for every function automatically. Create abstractions where they support separation of concerns, testing, or future implementation changes.

## 8. Validation Rules

Use plain TypeScript functions and classes. Do not use Zod, Joi, Yup, or any other schema-validation library.

Keep validation simple, consistent, and necessary.

### Remove unnecessary validation

- Remove redundant and duplicate checks.
- Do not repeat the same validation in the controller, use case, domain entity, and repository without a clear reason.
- Validate request inputs at the HTTP boundary.
- Enforce essential business rules in the domain or application layer.
- Enforce database integrity with appropriate database constraints.
- Do not validate the same property repeatedly just because it passes through multiple layers.
- Do not add checks for impossible conditions unless they protect against a real failure, security concern, or integrity problem.
- Do not create separate validation classes for simple checks that can be expressed clearly as ordinary functions.
- Do not remove essential validation merely to reduce the number of lines of code.

### Required validation

Validate the following where appropriate:

- Account name is present and is not empty after trimming.
- Account ID has a valid format before querying the database.
- The account exists before performing an operation on it.
- Transaction type is either `credit` or `debit`.
- Transaction amount is a valid number and greater than zero.
- Reference ID is present and valid.
- Duplicate references are rejected for the same account.
- Debits cannot exceed the available balance.
- Pagination values are valid and within reasonable limits.
- Transfer source and destination accounts exist.
- Transfer source and destination accounts are different.

The client must not control the initial account balance or system-generated creation timestamps.

## 9. Error Messages and Error Handling

Error messages must be clear, specific, consistent, and understandable to API consumers.

Avoid vague messages such as:

- `Something went wrong`
- `Invalid input`
- `Operation failed`

Use a specific message whenever the cause is known.

### Example error messages

| Situation | HTTP status | Message |
|---|---:|---|
| Missing account name | 400 | `Account name is required.` |
| Invalid account ID format | 400 | `Invalid account ID format.` |
| Account not found | 404 | `Account not found.` |
| Invalid transaction type | 400 | `Transaction type must be credit or debit.` |
| Invalid amount | 400 | `Amount must be greater than zero.` |
| Duplicate transaction reference | 409 | `A transaction with this reference ID already exists for this account.` |
| Insufficient balance | 400 | `Insufficient balance to complete this debit.` |
| Invalid pagination | 400 | `Page and limit must be valid positive integers.` |
| Same account used for transfer | 400 | `Source and destination accounts must be different.` |
| Unexpected server error | 500 | `An unexpected error occurred. Please try again later.` |

Keep these messages consistent with the actual business rules and response structure.

### Error-handling requirements

- Use a centralized Express error-handling middleware.
- Return appropriate HTTP status codes.
- Use consistent JSON response structures.
- Handle known business errors explicitly.
- Do not expose stack traces, database internals, or sensitive information to clients.
- Log unexpected server errors appropriately.
- Do not convert every error into a `400 Bad Request`.
- Do not catch an error just to throw the same error again.
- Preserve useful error information when wrapping errors.
- Avoid creating many custom error classes for minor variations.
- Create specific error classes only when they improve error handling or distinguish meaningful error categories.

Example error response:

```json
{
  "success": false,
  "message": "Account not found."
}
```

A successful response should also follow one consistent structure across the API.

## 10. Account Requirements

An account must have:

- A unique ID generated by the application or database.
- A required account name.
- An initial balance of zero.
- A system-generated creation timestamp.

Rules:

- The client must not provide the initial balance.
- The client must not set or override the creation timestamp.
- Validate and trim the account name.
- Return an appropriate error if the account cannot be found.
- Do not allow account creation to bypass the initial-balance rule.

## 11. Money and Amount Handling

Financial values must be handled consistently.

- Never accept a negative or zero amount for a credit or debit transaction.
- Reject invalid numeric values such as `NaN` and `Infinity`.
- Do not allow a client to set an account balance directly.
- Use one consistent representation for amounts across the application.
- Prefer integer minor units, such as paise, for storing and calculating money when the API contract supports it.
- If the project uses decimal rupee amounts, define and consistently enforce the precision and rounding rules.
- Avoid unnecessary conversions between different money representations.
- Do not introduce a `Money` value object unless it provides meaningful benefits and can be used consistently.
- If a `Money` class is used, keep its API small, clear, and easy to understand.
- Do not create multiple ways to perform the same amount validation or rounding operation.

Any amount-handling approach must prevent rounding inconsistencies and preserve accurate balances.

## 12. Transaction Requirements

Each transaction must contain the required information:

- Transaction ID.
- Account ID.
- Transaction type.
- Amount.
- Description, if required by the API contract.
- Reference ID.
- Creation timestamp.

### Credit transaction

- Increase the account balance by the transaction amount.
- Create the corresponding transaction record.
- Ensure the balance update and transaction creation succeed or fail together.

### Debit transaction

- Reject the transaction if the account does not have sufficient funds.
- Do not allow the balance to become negative.
- Decrease the account balance by the transaction amount.
- Create the corresponding transaction record.
- Ensure the balance update and transaction creation succeed or fail together.

### Duplicate references

- A reference ID must be unique within the same account.
- The same reference ID may be used by a different account.
- Enforce uniqueness with a compound database index on `accountId` and `referenceId`.
- A duplicate request must not create an additional transaction or change the balance.
- Return a consistent conflict response for duplicate transactions.
- Do not rely only on checking for duplicates in application code. Concurrent requests must also be protected by the database constraint.

### Transaction immutability

Once created, a transaction must not be modified or deleted through the API.

The following fields must remain unchanged:

- Account ID.
- Transaction type.
- Amount.
- Description.
- Reference ID.
- Creation timestamp.

Do not add update or delete transaction endpoints unless the assessment explicitly requires them.

If a correction is needed, prefer a compensating transaction rather than modifying the original ledger entry.

## 13. Atomicity and Balance Integrity

The account balance and transaction history must remain consistent.

- A successful credit or debit must update the balance and create its transaction record atomically.
- A failed transaction must not change the balance or create a transaction record.
- Use MongoDB transactions and Mongoose sessions where required.
- Ensure all database operations belonging to one transaction use the same session.
- Configure MongoDB appropriately for transaction support, such as using a replica set.
- Protect against concurrent debits causing a negative balance.
- Use conditional balance updates or an equivalent concurrency-safe approach.
- Do not perform the balance update separately from transaction creation without an atomicity strategy.

The balance must always match the net effect of successful ledger transactions.

## 14. Account Balance API

The balance endpoint must:

- Accept a valid account ID.
- Return the current balance for an existing account.
- Return `404 Not Found` if the account does not exist.
- Return an appropriate client error for a malformed account ID.
- Never allow the client to update the balance directly through the balance endpoint.

## 15. Transaction History API

The transaction history endpoint must support:

- Filtering by transaction type: `credit` or `debit`.
- Pagination.
- Current page.
- Page size.
- Total number of records.
- Total number of pages.
- Latest-first ordering based on the creation timestamp.

Rules:

- Validate pagination parameters.
- Use consistent defaults for page and limit.
- Set a reasonable maximum page size.
- Apply filtering before calculating pagination results.
- Sort transactions by creation time in descending order.
- Use a stable secondary sort, such as transaction ID, when timestamps are equal.
- Return pagination metadata consistently.
- Do not fetch every transaction and paginate in memory when database-level pagination is appropriate.

## 16. Optional Money Transfer

If implementing the bonus transfer feature:

- Validate both account IDs.
- Confirm both accounts exist.
- Reject transfers between the same account.
- Validate that the transfer amount is positive.
- Reject transfers when the source account has insufficient funds.
- Debit the source account and credit the destination account.
- Create corresponding ledger records for both sides of the transfer.
- Perform all balance updates and transaction inserts atomically.
- If any operation fails, roll back the entire transfer.
- Do not leave only one account updated.
- Use a consistent reference strategy for the two transfer records.

## 17. Database and Mongoose Rules

- Keep Mongoose models in the infrastructure layer.
- Keep database-specific code out of domain entities.
- Use appropriate indexes and constraints.
- Use a compound unique index for account-scoped transaction references.
- Avoid unnecessary database queries.
- Do not fetch a document again if the required data is already available and safely usable.
- Do not assume application-level checks alone prevent concurrent duplicate writes.
- Handle database errors appropriately.
- Do not expose raw Mongoose error messages directly to API clients.
- Keep database connection configuration in the appropriate configuration or infrastructure module.
- Read secrets and environment-specific values from environment variables.

## 18. API and HTTP Conventions

- Use clear, resource-oriented REST endpoints.
- Use the appropriate HTTP method for each operation.
- Return correct status codes.
- Use `201 Created` for successful resource creation where appropriate.
- Use `200 OK` for successful reads and operations that return a result.
- Use `400 Bad Request` for malformed or invalid input.
- Use `404 Not Found` for missing resources.
- Use `409 Conflict` for duplicate references or conflicting operations.
- Use `500 Internal Server Error` for unexpected server failures.
- Keep request and response formats consistent.
- Do not return success responses when the operation failed.
- Do not expose stack traces or internal database details.

## 19. Testing and Verification

Add tests where practical, especially for important business rules.

Prioritize tests for:

- Account creation with an initial balance of zero.
- Missing or invalid account names.
- Credit transactions.
- Debit transactions.
- Insufficient balance rejection.
- Duplicate reference handling.
- Same reference ID used by different accounts.
- Balance retrieval for existing and missing accounts.
- Transaction history filtering and pagination.
- Transaction immutability.
- Atomicity when a transaction operation fails.
- Concurrent debits.
- Transfers, if implemented.

Do not add unnecessary tests that repeat the same scenario without adding coverage.

Before considering a change complete:

1. Run the TypeScript build.

2. Fix errors introduced by the change.
3. Review the changed files for redundant validation and confusing code.
4. Verify that the existing functionality still works.

Do not claim that a build or test passed unless it was actually run successfully.

## 20. Git Workflow

Before changing code, inspect the current Git state.

Useful commands:

```bash
git status
git branch --show-current
git log -5 --oneline
```

Before editing existing code:

- Check the current branch.
- Check whether there are uncommitted changes.
- Inspect the relevant files.
- Understand the existing implementation before changing it.

When implementing a task:

1. Identify the exact files involved.
2. Make only the necessary changes.
3. Review the diff.
4. Run the build and relevant tests.
5. Commit changes with a meaningful message when requested or appropriate.
6. Push only to the intended branch.

Useful commands:

```bash
git diff
git diff --staged
git status
```

Rules:

- Never discard the user's uncommitted changes.
- Never use `git reset --hard` without explicit permission.
- Never force-push without explicit permission.
- Never overwrite unrelated work.
- Never commit `.env` files, passwords, API keys, or other secrets.
- Do not create unnecessary branches or commits.
- Follow the repository's existing branch naming and workflow.

## 21. Environment Configuration

- Use environment variables for configuration that differs between environments.
- Keep `.env` out of version control.
- Provide a `.env.example` containing placeholder values, not real secrets.
- Validate essential environment configuration at application startup.
- Use clear error messages when required configuration is missing.
- Do not hardcode database credentials or secrets.

## 22. Documentation

Maintain a useful `README.md` containing:

- Project overview.
- Technology stack.
- Prerequisites.
- Installation steps.
- Environment configuration.
- How to start the application locally.
- How to run the build and tests.
- API endpoints.
- Example requests and responses.
- Important assumptions and business rules.
- Any MongoDB replica-set requirement for transactions.

Document the API clearly enough that another developer can run and test the application without guessing.

## 23. Instructions for Coding Agents

When asked to implement a feature or fix a bug:

1. Inspect the existing code before making assumptions.
2. Identify the relevant files and current architecture.
3. Explain the intended change briefly when useful.
4. Implement the smallest complete solution.
5. Follow the existing project conventions unless there is a clear reason to improve them.
6. Use normal, descriptive function and variable names.
7. Avoid unnecessary abstractions, getters, setters, wrapper classes, static methods, and helper functions.
8. Do not use Zod or any other schema-validation library.
9. Remove redundant validation, but preserve all essential business and data-integrity rules.
10. Use clear and consistent error messages.
11. Do not rewrite unrelated code.
12. Do not silently change public API behavior.
13. Run the build and relevant tests when possible.
14. Report which files changed and what was verified.
15. Clearly disclose any unresolved issues or checks that could not be run.

When uncertain, prefer the simplest implementation that satisfies the requirements correctly.

## 24. Definition of Done

A task is complete when:

- The requested behavior works.
- Essential validation is present without unnecessary duplication.
- Error messages are clear and consistent.
- Function and variable names are descriptive.
- The code follows the existing architecture.
- Financial integrity and transaction atomicity are preserved where applicable.
- No unrelated code has been changed.
- The TypeScript build succeeds.
- Relevant tests pass, or unrun tests are clearly disclosed.
- Documentation is updated when necessary.
