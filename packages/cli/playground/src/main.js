const { SnippetResolver } = require('../dist/index.cjs');

async function generateSnippet() {
    const resolver = new SnippetResolver();
    const go = await resolver.sdk("go");
    const response = await go.endpoint("POST /v2/cards").generate({
        auth: {
            type: "bearer",
            token: "<YOUR_API_KEY>"
        },
        requestBody: {
            idempotency_key: "4935a656-a929-4792-b97c-8848be85c27c",
            source_id: "cnon:uIbfJXhXETSP197M3GB",
            card: {
                cardholder_name: "Amelia Earhart",
                billing_address: {
                    address_line_1: "500 Electric Ave",
                    address_line_2: "Suite 600",
                    locality: "New York",
                    administrative_district_level_1: "NY",
                    postal_code: "10003",
                    country: "US"
                },
                customer_id: "VDKXEEKPJN48QDG3BGGFAK05P8",
                reference_id: "user-id-1"
            }
        }
    });
    return response.snippet;
}

async function main() {
    try {
        const result = await generateSnippet();
        document.body.innerHTML = `<h1>Result: ${result}</h1>`;
    } catch (error) {
        console.error("Failed to generate snippet:", error);
    }
}

main();