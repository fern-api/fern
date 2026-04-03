using SeedCsharpXmlEntities;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedCsharpXmlEntitiesClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.GetTimeZoneAsync();
    }

}
