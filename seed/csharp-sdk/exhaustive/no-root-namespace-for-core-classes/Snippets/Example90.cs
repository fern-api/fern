using SeedApi;
using SeedApi.Core;
using System.Globalization;

public partial class Examples
{
    public async Task Example90() {
        var client = new SeedApiClient(
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
