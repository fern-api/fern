using SeedUnions;
using System.Globalization;

public partial class Examples
{
    public async Task Example2() {
        var client = new SeedUnionsClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Bigunion.UpdateManyAsync(
            new List<BigUnion>(){
                new BigUnion(
                    new NormalSweet {
                        Value = "value"
                    }
                ) {
                    Id = "id",CreatedAt = DateTime.Parse("2024-01-15T09:30:00Z", null, DateTimeStyles.AdjustToUniversal),ArchivedAt = DateTime.Parse("2024-01-15T09:30:00Z", null, DateTimeStyles.AdjustToUniversal),
                },
                new BigUnion(
                    new NormalSweet {
                        Value = "value"
                    }
                ) {
                    Id = "id",CreatedAt = DateTime.Parse("2024-01-15T09:30:00Z", null, DateTimeStyles.AdjustToUniversal),ArchivedAt = DateTime.Parse("2024-01-15T09:30:00Z", null, DateTimeStyles.AdjustToUniversal),
                },
            }
        );
    }

}
