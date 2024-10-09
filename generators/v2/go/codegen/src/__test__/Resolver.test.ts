import { ResolverProvider } from "../resolver/ResolverProvider";

describe("resolver", () => {
    it("inlined request", async () => {
        const resolverProvider = new ResolverProvider();
        const resolver = resolverProvider.getResolver({ language: "go" });

        const snippet = resolver.resolve({
            snippet: {
                endpointID: "endpoint_.user.create",
                requestBody: {
                    name: "John Doe",
                    age: 30,
                    status: "ACTIVE"
                }
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
