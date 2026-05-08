using SeedApi;
using SeedApi.Endpoints;
using System.Globalization;

public partial class Examples
{
    public async Task Example52() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Object.GetAndReturnNestedWithRequiredFieldAsync(
            new GetAndReturnNestedWithRequiredFieldObjectRequest {
                StringValue = "stringValue",
                Body = new TypesNestedObjectWithRequiredField {
                    String = "string",
                    NestedObject = new TypesObjectWithOptionalField {
                        String = "string",
                        Integer = 1,
                        Long = 1000000L,
                        Double = 1.1,
                        Bool = true,
                        Datetime = DateTime.Parse("2024-01-15T09:30:00Z", null, DateTimeStyles.AdjustToUniversal),
                        Date = DateOnly.Parse("2023-01-15"),
                        Uuid = "uuid",
                        Base64 = "base64",
                        List = new List<string>(){
                            "list",
                            "list",
                        }
                        ,
                        Set = new List<string>(){
                            "set",
                            "set",
                        }
                        ,
                        Map = new Dictionary<string, string?>(){
                            ["map"] = "map",
                        }
                        ,
                        Bigint = 1
                    }
                }
            }
        );
    }

}
