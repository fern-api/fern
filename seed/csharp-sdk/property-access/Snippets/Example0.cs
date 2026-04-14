using SeedPropertyAccess;

public partial class Examples
{
    public async Task Example0() {
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
