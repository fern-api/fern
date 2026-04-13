using SeedApi;

namespace Usage;

public class Example3
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.PatchcomplexAsync(
            new ServicePatchComplexRequest {
                Id = "id",
                Name = "name",
                Age = 1,
                Active = true,
                Metadata = new Dictionary<string, object?>(){
                    ["metadata"] = new Dictionary<string, object>()
                    {
                        ["key"] = "value",
                    }
                    ,
                }
                ,
                Tags = new List<string>(){
                    "tags",
                    "tags",
                }
                ,
                Email = "email",
                Nickname = "nickname",
                Bio = "bio",
                ProfileImageUrl = "profileImageUrl",
                Settings = new Dictionary<string, object?>(){
                    ["settings"] = new Dictionary<string, object>()
                    {
                        ["key"] = "value",
                    }
                    ,
                }

            }
        );
    }

}
