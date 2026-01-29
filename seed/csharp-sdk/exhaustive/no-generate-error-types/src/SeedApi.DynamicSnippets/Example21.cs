using SeedExhaustive;
using SeedExhaustive.Types;
using System.Globalization;

namespace Usage;

public class Example21
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
                DatetimeLikeString = "2023-08-31T14:15:22Z",
                ActualDatetime = DateTime.Parse("2023-08-31T14:15:22Z", null, DateTimeStyles.AdjustToUniversal)
            }
        );
    }

}
