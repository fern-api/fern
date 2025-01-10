import { SeedObjectClient } from "../..";

async function main() {
    const client = new SeedObjectClient({
        environment: "https://api.fern.com",
    });
    await client.getUndiscriminatedUnion({
        bar: {
            foo: "foo",
            bar: {
                foo: "foo",
                ref: {
                    foo: "foo",
                },
            },
            ref: {
                foo: "foo",
            },
        },
        foo: "foo",
    });
}
main();
