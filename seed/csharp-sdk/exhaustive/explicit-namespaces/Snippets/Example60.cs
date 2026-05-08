using SeedApi;
using System.Globalization;

public partial class Examples
{
    public async Task Example60() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Object.GetAndReturnWithDatetimeLikeStringAsync(
            new TypesObjectWithDatetimeLikeString {
                DatetimeLikeString = "datetimeLikeString",
                ActualDatetime = DateTime.Parse("2024-01-15T09:30:00Z", null, DateTimeStyles.AdjustToUniversal)
            }
        );
    }

}
