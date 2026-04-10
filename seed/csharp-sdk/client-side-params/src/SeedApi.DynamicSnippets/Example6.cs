using SeedClientSideParams;

namespace Usage;

public class Example6
{
    public async Task Do() {
        var client = new SeedClientSideParamsClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.UpdateUserAsync(
            "userId",
            new UpdateUserRequest {
                Email = "email",
                EmailVerified = true,
                Username = "username",
                PhoneNumber = "phone_number",
                PhoneVerified = true,
                UserMetadata = new Dictionary<string, object?>(){
                    ["user_metadata"] = new Dictionary<string, object>()
                    {
                        ["key"] = "value",
                    }
                    ,
                }
                ,
                AppMetadata = new Dictionary<string, object?>(){
                    ["app_metadata"] = new Dictionary<string, object>()
                    {
                        ["key"] = "value",
                    }
                    ,
                }
                ,
                Password = "password",
                Blocked = true
            }
        );
    }

}
