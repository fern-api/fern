using SeedApi;

public partial class Examples
{
    public async Task Example17() {
        var client = new SeedErrorsClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Package.TestAsync(
            new PackageTestRequest {
                For = "for"
            }
        );
    }

}
