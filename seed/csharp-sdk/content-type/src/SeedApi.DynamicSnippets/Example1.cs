using global::System.Threading.Tasks;
using SeedContentTypes;

namespace Usage;

public class Example1
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedContentTypesClient(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.PatchComplexAsync(
            "id",
            new PatchComplexRequest{
                Name = "name",
                Age = 1,
                Active = true,
                Metadata = new Dictionary<string, object>(){
                    ["metadata"] = new Dictionary<string, object>() {
                        ["key"] = "value",
                    },
                },
                Tags = new List<string>(){
                    "tags",
                    "tags",
                },
                Email = "email",
                Nickname = "nickname",
                Bio = "bio",
                ProfileImageUrl = "profileImageUrl",
                Settings = new Dictionary<string, object>(){
                    ["settings"] = new Dictionary<string, object>() {
                        ["key"] = "value",
                    },
                }
            }
        );
    }

}
