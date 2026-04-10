using SeedPropertyAccess;

namespace Usage;

public class Example0
{
    public async Task Do() {
        var client = new SeedPropertyAccessClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.CreateUserAsync(
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
