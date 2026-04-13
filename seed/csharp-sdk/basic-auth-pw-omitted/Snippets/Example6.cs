using SeedApi;

public partial class Examples
{
    public async Task Example6() {
        var client = new SeedBasicAuthPwOmittedClient(
            username: "<username>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.FolderService.FolderServiceUnknownRequestAsync(
            new Dictionary<string, object>()
            {
                ["key"] = "value",
            }
        );
    }

}
