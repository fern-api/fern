using SeedExhaustive;

namespace Usage;

public class Example37
{
    public async Task Do() {
        var client = new SeedExhaustiveClient(
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
