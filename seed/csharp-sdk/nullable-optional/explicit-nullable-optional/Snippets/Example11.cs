using SeedNullableOptional;

public partial class Examples
{
    public async Task Example11() {
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
