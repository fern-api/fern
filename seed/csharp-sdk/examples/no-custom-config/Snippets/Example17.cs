using SeedExamples;

public partial class Examples
{
    public async Task Example17() {
        var client = new SeedExamplesClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.GetMetadataAsync(
            new GetMetadataRequest {
                Shallow = false,
                Tag = new List<string>(){
                    "development",
                }
                ,
                XApiVersion = "0.0.1"
            }
        );
    }

}
