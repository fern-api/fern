using SeedApi;

namespace Usage;

public class Example14
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.GetmetadataAsync(
            new ServiceGetMetadataRequest {
                Shallow = true,
                Tag = new List<string>(){
                    "tag",
                }
                ,
                ApiVersion = "apiVersion"
            }
        );
    }

}
