using SeedApi;

namespace Usage;

public class Example0
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.CreateUserAsync(
            new User {
                Password = "password",
                Profile = new UserProfile {
                    Name = "name",
                    Verification = new UserProfileVerification(),
                    Ssn = "ssn"
                }
            }
        );
    }

}
