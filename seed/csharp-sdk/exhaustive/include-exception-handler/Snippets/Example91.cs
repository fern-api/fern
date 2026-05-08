using SeedApi;

public partial class Examples
{
    public async Task Example91() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Primitive.GetAndReturnDateAsync(
            DateOnly.Parse("2023-01-15")
        );
    }

}
