using SeedApi;

namespace Usage;

public class Example23
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Nullableoptional.UpdatetagsAsync(
            new NullableOptionalUpdateTagsRequest {
                UserId = "userId",
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
