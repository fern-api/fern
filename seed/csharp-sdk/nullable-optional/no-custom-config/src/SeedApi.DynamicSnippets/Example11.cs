using SeedNullableOptional;

namespace Usage;

public class Example11
{
    public async Task Do() {
        var client = new SeedNullableOptionalClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.NullableOptional.UpdateTagsAsync(
            "userId",
            new UpdateTagsRequest {
                Tags = new List<string>(){
                    "tags",
                    "tags",
                }
                ,
                Categories = new List<string>(){
                    "categories",
                    "categories",
                }
                ,
                Labels = new List<string>(){
                    "labels",
                    "labels",
                }

            }
        );
    }

}
