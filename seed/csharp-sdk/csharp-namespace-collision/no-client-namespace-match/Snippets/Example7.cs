using Contoso.Net;

public partial class Examples
{
    public async System.Threading.Tasks.Task Example7() {
        var client = new ContosoClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.System.GetUserAsync(
            "userId"
        );
    }

}
