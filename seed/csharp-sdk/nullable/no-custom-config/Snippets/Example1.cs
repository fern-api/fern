using SeedApi;

public partial class Examples
{
    public async Task Example1() {
        var client = new SeedNullableClient(
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
