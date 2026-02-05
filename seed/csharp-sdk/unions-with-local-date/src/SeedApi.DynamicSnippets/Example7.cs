using SeedUnions;
using System.Globalization;

namespace Usage;

public class Example7
{
    public async Task Do() {
        var client = new SeedUnionsClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Types.UpdateAsync(
            new UnionWithTime(
                new UnionWithTime.Datetime(DateTime.Parse("datetime", null, DateTimeStyles.AdjustToUniversal))
            )
        );
    }

}
