using SeedApi;

public partial class Examples
{
    public async Task Example1() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.UpdateProfileIdentifierAsync(
            new IdentifierUpdate {
                ProfileId = "profileId",
                IdTypePathParam = "idTypePathParam",
                IdType = "idType",
                OldValue = "oldValue",
                NewValue = "newValue"
            }
        );
    }

}
