using global::System.Threading.Tasks;
using SeedNullable;
using System.Globalization;

namespace Usage;

public class Example1
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedNullableClient(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Nullable.CreateUserAsync(
            new CreateUserRequest{
                Username = "username",
                Tags = new List<string>(){
                    "tags",
                    "tags",
                },
                Metadata = new Metadata{
                    CreatedAt = DateTime.Parse("2024-01-15T09:30:00Z", null, DateTimeStyles.AdjustToUniversal),
                    UpdatedAt = DateTime.Parse("2024-01-15T09:30:00Z", null, DateTimeStyles.AdjustToUniversal),
                    Avatar = "avatar",
                    Activated = true,
                    Status = new Status(),
                    Values = new Dictionary<string, string?>(){
                        ["values"] = "values",
                    }
                },
                Avatar = "avatar"
            }
        );
    }

}
