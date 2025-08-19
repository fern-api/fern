using global::System.Threading.Tasks;
using SeedSystem;
using SeedSystem.System;

namespace Usage;

public class Example2
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new global::SeedSystem.SeedSystemClient(
            clientOptions: new global::SeedSystem.ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.System.CreateUserAsync(
            new global::SeedSystem.System.User{
                Line1 = "line1",
                Line2 = "line2",
                City = "city",
                State = "state",
                Zip = "zip"
            }
        );
    }

}
