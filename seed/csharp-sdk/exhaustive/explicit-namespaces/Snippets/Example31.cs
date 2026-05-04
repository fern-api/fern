using SeedExhaustive;
using SeedExhaustive.Types.Object;
using System.Globalization;

public partial class Examples
{
    public async Task Example31() {
        var client = new SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Object.GetAndReturnWithDatetimeLikeStringAsync(
            new ObjectWithDatetimeLikeString {
                DatetimeLikeString = "datetimeLikeString",
                ActualDatetime = DateTime.Parse("2024-01-15T09:30:00Z", null, DateTimeStyles.AdjustToUniversal)
            }
        );
    }

}
