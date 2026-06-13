using SeedExhaustive;

public partial class Examples
{
    public async Task Example62() {
        var client = new SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.InlinedRequests.PostWithArrayBodyAndHeadersAsync(
            new PostWithArrayBodyAndHeaders {
                XCustomHeader = "X-Custom-Header",
                Body = new List<string>(){
                    "string",
                    "string",
                }

            }
        );
    }

}
