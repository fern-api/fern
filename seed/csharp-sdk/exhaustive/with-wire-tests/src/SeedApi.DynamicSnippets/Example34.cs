using SeedExhaustive;
using System.Globalization;

namespace Usage;

public class Example34
{
    public async Task Do() {
        var client = new SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Primitive.GetAndReturnDatetimeAsync(
            DateTime.Parse("2024-01-15T09:30:00Z", null, DateTimeStyles.AdjustToUniversal)
        );
    }

}
