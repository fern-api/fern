import { ExampleClient } from "@example/sdk";

const client = new ExampleClient({
    apiKey: "your-api-key"
});

await client.users.get("123");
