using SeedApi;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.UpdateProfileIdentifierAsync(
            new IdentifierUpdate {
                ProfileId = "profile_123",
                IdTypePathParam = "email",
                IdType = "phone",
                OldValue = "+13175556789",
                NewValue = "+13175556798"
            }
        );
    }

}
