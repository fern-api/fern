using SeedApi;

namespace Usage;

public class Example1
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Nullable.GetusersAsync(
            new NullableGetUsersRequest {
                Usernames = new List<string>(){
                    "usernames",
                }
                ,
                Avatar = "avatar",
                Activated = new List<bool>(){
                    true,
                }
                ,
                Tags = new List<string>(){
                    "tags",
                }
                ,
                Extra = true
            }
        );
    }

}
