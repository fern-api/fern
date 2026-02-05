using SeedApi;

namespace Usage;

public class Example2
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.TestGroup.TestMethodNameAsync(
            new TestMethodNameTestGroupRequest {
                PathParam = "path_param",
                QueryParamObject = new PlainObject {
                    Id = "id",
                    Name = "name"
                },
                QueryParamInteger = 1,
                Body = new PlainObject {
                    Id = "id",
                    Name = "name"
                }
            }
        );
    }

}
