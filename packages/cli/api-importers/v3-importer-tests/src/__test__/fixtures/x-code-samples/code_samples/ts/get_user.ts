interface ClientOptions {
    apiKey: string;
}

declare class ExampleClient {
    constructor(options: ClientOptions);
    users: {
        get: (id: string) => Promise<unknown>;
    };
}

async function run() {
    const client = new ExampleClient({
        apiKey: "your-api-key"
    });

    await client.users.get("123");
}

void run();
