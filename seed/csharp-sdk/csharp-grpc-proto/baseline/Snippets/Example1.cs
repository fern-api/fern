using SeedApi;
using OneOf;

public partial class Examples
{
    public async Task Example1() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.UserService.CreateAsync(
            new CreateRequest {
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
