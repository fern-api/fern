using SeedUnions;
using System.Globalization;

namespace Usage;

public class Example1
{
    public async Task Do() {
        var client = new SeedUnionsClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Bigunion.UpdateAsync(
            new BigUnion(
                new NormalSweet {
                    Value = "value"
                }
            ) {
                Id = "id",CreatedAt = DateTime.Parse("2024-01-15T09:30:00Z", null, DateTimeStyles.AdjustToUniversal),ArchivedAt = DateTime.Parse("2024-01-15T09:30:00Z", null, DateTimeStyles.AdjustToUniversal),
            }
        );
    }

}
