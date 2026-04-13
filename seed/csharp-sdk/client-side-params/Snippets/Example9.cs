using SeedApi;

public partial class Examples
{
    public async Task Example9() {
        var client = new SeedClientSideParamsClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.CreateuserAsync(
            new CreateUserRequest {
                Email = "email",
                EmailVerified = true,
                Username = "username",
                Password = "password",
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
                Connection = "connection"
            }
        );
    }

}
