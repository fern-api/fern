```typescript
import { SeedRequestParametersClient } from "@fern/request-parameters";

const client = new SeedRequestParametersClient({
  environment: "YOUR_BASE_URL",
});
await client.user.createUsername({
  tags: ["tags", "tags"],
  username: "username",
  password: "password",
  name: "test",
});

```


```typescript
import { SeedRequestParametersClient } from "@fern/request-parameters";

const client = new SeedRequestParametersClient({
  environment: "YOUR_BASE_URL",
});
await client.user.createUsernameWithReferencedType({
  tags: ["tags", "tags"],
  username: "username",
  password: "password",
  name: "test",
});

```


```typescript
import { SeedRequestParametersClient } from "@fern/request-parameters";

const client = new SeedRequestParametersClient({
  environment: "YOUR_BASE_URL",
});
await client.user.createAgent({
  project: "main",
  audio_speed: 1,
  boosted_keywords: ["Load ID", "dispatch"],
  configuration_endpoint: {
    headers: {
      Authorization: "Bearer token123",
    },
    timeout_ms: 7000,
    url: "https://api.example.com/config",
  },
  name: "support-agent",
  no_input_poke_sec: 30,
  no_input_poke_text: "Are you still there?",
  system_prompt:
    "You are an expert in {{subject}}. Be friendly, helpful and concise.",
  template_variables: {
    subject: {
      default_value: "Chess",
    },
  },
  timezone: "America/Los_Angeles",
  tools: [],
  voice_id: "sarah",
  welcome_message: "Hi {{customer_name}}. How can I help you today?",
});

```


```typescript
import { SeedRequestParametersClient } from "@fern/request-parameters";

const client = new SeedRequestParametersClient({
  environment: "YOUR_BASE_URL",
});
await client.user.createAgent({
  project: "main",
  audio_speed: 1.5,
  boosted_keywords: ["boosted_keywords", "boosted_keywords"],
  configuration_endpoint: {
    headers: {
      headers: "headers",
    },
    timeout_ms: 1,
    url: "url",
  },
  name: "name",
  no_input_end_conversation_sec: 1,
  no_input_poke_sec: 1,
  no_input_poke_text: "Are you still there?",
  system_prompt: "Respond in 1-2 sentences.",
  tasks: [
    {
      description: "description",
      name: "name",
    },
    {
      description: "description",
      name: "name",
    },
  ],
  template_variables: {
    template_variables: {
      default_value: "default_value",
    },
  },
  timezone: "timezone",
  tools: [],
  voice_id: "grant",
  welcome_message: "",
});

```


```typescript
import { SeedRequestParametersClient } from "@fern/request-parameters";

const client = new SeedRequestParametersClient({
  environment: "YOUR_BASE_URL",
});
await client.user.getUsername({
  limit: 1,
  id: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
  date: "2023-01-15",
  deadline: "2024-01-15T09:30:00Z",
  bytes: "SGVsbG8gd29ybGQh",
  user: {
    name: "name",
    tags: ["tags", "tags"],
  },
  userList: [
    {
      name: "name",
    },
    {
      name: "name",
    },
  ],
  optionalDeadline: "2024-01-15T09:30:00Z",
  keyValue: {
    keyValue: "keyValue",
  },
  optionalString: "optionalString",
  nestedUser: {
    name: "name",
    user: {
      name: "name",
      tags: ["tags", "tags"],
    },
  },
  optionalUser: {
    name: "name",
    tags: ["tags", "tags"],
  },
  excludeUser: {
    name: "name",
    tags: ["tags", "tags"],
  },
  filter: "filter",
  longParam: 1000000,
  bigIntParam: "1000000",
});

```


