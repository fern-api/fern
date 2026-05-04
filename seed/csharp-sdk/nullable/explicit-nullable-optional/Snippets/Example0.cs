using SeedNullable;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedNullableClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Nullable.GetUsersAsync(
            new GetUsersRequest {
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
