import { Resolver } from "../resolver/Resolver";

describe("resolver", () => {
    it("inlined request", async () => {
        const resolver = new Resolver();
        const snippets = resolver.resolve({ language: "go" });

        const snippet = snippets.generate({
            endpointID: "endpoint_.user.create",
            requestBody: {
                name: "John Doe",
                age: 30,
                status: "ACTIVE"
            }
        });

        // Include a \n prefix for easier readability.
        expect("\n" + snippet).toBe(`
import (
    client "github.com/acme/acme/client"
    acme "github.com/acme/acme"
)

client := client.NewClient()
client.User.Create(
    &acme.CreateUserRequest{
        Name: "John Doe",
        Age: 30,
        Status: acme.StatusActive,
    },
)`);
    });
});
