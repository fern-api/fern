using SeedExhaustive;
using SeedExhaustive.Core;
using SeedExhaustive.Types;
using System.Globalization;

namespace Usage;

public class Example7
{
    public async Task Do() {
        var client = new SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.ContentType.PostJsonPatchContentTypeAsync(
            new ObjectWithOptionalField {
                String = "string",
                Integer = 1,
                Long = 1000000L,
                Double = 1.1,
                Bool = true,
                Datetime = DateTime.Parse("2024-01-15T09:30:00Z", null, DateTimeStyles.AdjustToUniversal),
                Date = DateOnly.Parse("2023-01-15"),
                Uuid = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                Base64 = "SGVsbG8gd29ybGQh",
                List = new List<string>(){
                    "list",
                    "list",
                }
                ,
                Set = new HashSet<string>(){
                    "set",
                }
                ,
                Map = new Dictionary<int, string>(){
                    [1] = "map",
                }
                ,
                Bigint = "1000000"
            }
        );
    }

}
