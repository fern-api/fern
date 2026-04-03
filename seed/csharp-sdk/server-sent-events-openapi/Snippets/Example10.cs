using SeedApi;

public partial class Examples
{
    public async Task Example10() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await foreach (var item in client.StreamDataContextWithEnvelopeSchemaAsync(
            new StreamRequest()
        ))
        {
            /* consume each item */
        }
        ;
    }

}
