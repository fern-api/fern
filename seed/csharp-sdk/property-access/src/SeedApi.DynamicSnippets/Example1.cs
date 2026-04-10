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

        await client._.CreateUserAsync(
            new User {
                Id = "id",
                Email = "email",
                Password = "password",
                Profile = new UserProfile {
                    Name = "name",
                    Verification = new UserProfileVerification {
                        Verified = "verified"
                    },
                    Ssn = "ssn"
                }
            }
        );
    }

}
