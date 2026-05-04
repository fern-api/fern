using SeedExamples;

public partial class Examples
{
    public async Task Example18() {
        var client = new SeedExamplesClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.GetMetadataAsync(
            new GetMetadataRequest {
                Shallow = true,
                Tag = new List<string>(){
                    "tag",
                }
                ,
                XApiVersion = "X-API-Version"
            }
        );
    }

}
