using SeedApi;
using System.Globalization;

namespace Usage;

public class Example3
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Nullable.CreateuserAsync(
            new NullableCreateUserRequest {
                Username = "username",
                Tags = new List<string>(){
                    "tags",
                    "tags",
                }
                ,
                Metadata = new Metadata {
                    CreatedAt = DateTime.Parse("2024-01-15T09:30:00Z", null, DateTimeStyles.AdjustToUniversal),
                    UpdatedAt = DateTime.Parse("2024-01-15T09:30:00Z", null, DateTimeStyles.AdjustToUniversal),
                    Avatar = "avatar",
                    Activated = true,
                    Status = new Status(
                        new StatusActive()
                    ),
                    Values = new Dictionary<string, string?>(){
                        ["values"] = "values",
                    }

                },
                Avatar = "avatar"
            }
        );
    }

}
