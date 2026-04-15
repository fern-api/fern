using SeedExhaustive;

public partial class Examples
{
    public async Task Example42() {
        var client = new SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Params.GetWithBooleanPathAsync(
            true
        );
    }

}
