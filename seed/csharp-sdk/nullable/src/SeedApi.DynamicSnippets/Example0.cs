using global::System.Threading.Tasks;
using SeedNullable;
using SeedNullable.Core;

namespace Usage;

public class Example0
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedNullableClient(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Nullable.GetUsersAsync(
            new GetUsersRequest{
                Usernames = new List<string?>(){
                    "usernames",
                },
                Avatar = "avatar",
                Activated = new List<bool?>(){
                    true,
                },
                Tags = new List<string?>(){
                    "tags",
                },
                Extra = true
            }
        );
    }

}
