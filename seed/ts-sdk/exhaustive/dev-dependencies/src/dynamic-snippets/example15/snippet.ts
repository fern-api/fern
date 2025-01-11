import { FiddleClient } from "../..";

async function main() {
    const client = new FiddleClient({
        environment: "https://api.fern.com",
        token: "<token>",
    });
    await client.endpoints.object.getAndReturnWithOptionalField({
        string: "string",
        integer: 1,
        long: 1000000,
        double: 1.1,
        bool: true,
        datetime: new Date("2024-01-15T09:30:00Z"),
        date: "2023-01-15",
        uuid: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
        base64: "SGVsbG8gd29ybGQh",
        list: [
            "list",
            "list",
        ],
        set: new Set([
            "set",
        ]),
        map: {
            1: "map",
        },
        bigint: "1000000",
    });
}
main();
