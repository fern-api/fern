using global::System.Threading.Tasks;
using SeedExhaustive;
using System.Globalization;

namespace Usage;

public class Example41
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedExhaustive.SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new SeedExhaustive.ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Primitive.GetAndReturnDatetimeAsync(
            DateTime.Parse("2024-01-15T09:30:00Z", null, System.Globalization.DateTimeStyles.AdjustToUniversal)
        );
    }

}
