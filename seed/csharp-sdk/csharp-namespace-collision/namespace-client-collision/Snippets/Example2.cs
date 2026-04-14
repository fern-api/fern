using Contoso.Net;

public partial class Examples
{
    public async System.Threading.Tasks.Task Example2() {
        var client = new Contoso.Net.Contoso(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.ScimConfiguration.GetConfigurationAsync();
    }

}
