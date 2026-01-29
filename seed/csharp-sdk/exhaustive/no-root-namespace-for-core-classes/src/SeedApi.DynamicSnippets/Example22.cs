using SeedExhaustive;
using SeedExhaustive.Core;
using SeedExhaustive.Types;
using System.Globalization;

namespace Usage;

public class Example22
{
    public async Task Do() {
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
