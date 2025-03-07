using global::System.Threading.Tasks;
using SeedApi;
using SeedApi.Core;
using OneOf;

namespace Usage;

public class Example1
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Userservice.CreateAsync(
            new CreateRequest{
                Username = "username",
                Email = "email",
                Age = 1u,
                Weight = 1.1f,
                Metadata = new Dictionary<string, OneOf<double, string, bool>>(){
                    ["metadata"] = 1.1,
                }
            }
        );
    }

}
