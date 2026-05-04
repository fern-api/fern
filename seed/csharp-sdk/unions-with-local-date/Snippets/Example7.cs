using SeedUnions;
using System.Globalization;

public partial class Examples
{
    public async Task Example7() {
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
