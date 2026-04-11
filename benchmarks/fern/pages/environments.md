---
title: Environments
description: Understand Square's sandbox and production environments for development and testing.
slug: environments
---

# Environments

Square provides separate environments for development and production. Understanding the differences helps you build and test safely.

## Environment comparison

| Feature | Sandbox | Production |
|---------|---------|------------|
| Base URL | `connect.squaresandbox.com` | `connect.squareup.com` |
| Real payments | No | Yes |
| Real money | No | Yes |
| Test cards | Yes | No |
| Rate limits | Same as production | Standard limits |
| Data isolation | Completely separate | Live data |
| Webhooks | Sandbox-specific | Production events |

## Sandbox environment

The sandbox is a fully functional replica of the production API that uses test data and never processes real payments.

### Setting up sandbox

1. Log in to the [Square Developer Dashboard](https://developer.squareup.com)
2. Create or select an application
3. Navigate to the "Credentials" tab
4. Copy the Sandbox Access Token

```typescript
const client = new SquareClient({
  token: process.env.SQUARE_SANDBOX_TOKEN,
  environment: "sandbox",
});
```

### Sandbox test accounts

The sandbox provides default test accounts for each supported country:

| Country | Currency | Default location |
|---------|----------|-----------------|
| United States | USD | Pre-configured |
| Canada | CAD | Pre-configured |
| United Kingdom | GBP | Pre-configured |
| Australia | AUD | Pre-configured |
| Japan | JPY | Pre-configured |
| Ireland | EUR | Pre-configured |
| France | EUR | Pre-configured |
| Spain | EUR | Pre-configured |

### Sandbox test cards

Use these card numbers for testing different scenarios:

| Card | Number | Result |
|------|--------|--------|
| Visa (success) | 4532 7597 3454 5858 | Successful charge |
| Visa (decline) | 4000 0000 0000 0002 | Card declined |
| Mastercard | 5105 1051 0510 5100 | Successful charge |
| Amex | 3400 000000 00009 | Successful charge |
| Discover | 6011 0000 0000 0004 | Successful charge |
| CVV failure | 4000 0000 0000 0010 | CVV check failed |
| AVS failure | 4000 0000 0000 0028 | Address check failed |

All test cards use:
- Any future expiration date
- Any 3-digit CVV (4 digits for Amex)
- Any billing ZIP code

## Production environment

### Switching to production

Before going live, ensure you've completed the following checklist:

- [ ] All tests pass in the sandbox environment
- [ ] Error handling covers all error categories
- [ ] Idempotency keys are properly implemented
- [ ] Webhook signature verification is in place
- [ ] Rate limiting and retry logic is implemented
- [ ] OAuth token refresh is working (if applicable)
- [ ] PCI compliance requirements are met
- [ ] Application has been reviewed and approved (if using OAuth)

### Production credentials

```typescript
const client = new SquareClient({
  token: process.env.SQUARE_PRODUCTION_TOKEN,
  environment: "production",
});
```

## Environment-specific configuration

Use environment variables to manage configuration across environments:

```typescript
interface Config {
  squareToken: string;
  squareEnvironment: "sandbox" | "production";
  webhookSignatureKey: string;
}

function getConfig(): Config {
  const env = process.env.NODE_ENV === "production" ? "production" : "sandbox";

  return {
    squareToken:
      env === "production"
        ? process.env.SQUARE_PRODUCTION_TOKEN!
        : process.env.SQUARE_SANDBOX_TOKEN!,
    squareEnvironment: env,
    webhookSignatureKey:
      env === "production"
        ? process.env.SQUARE_PROD_WEBHOOK_KEY!
        : process.env.SQUARE_SANDBOX_WEBHOOK_KEY!,
  };
}
```

## Data isolation

Sandbox and production environments are completely isolated:

- Objects created in sandbox do not exist in production (and vice versa)
- Tokens from one environment cannot be used in the other
- Webhook events are environment-specific
- OAuth authorizations are separate per environment
