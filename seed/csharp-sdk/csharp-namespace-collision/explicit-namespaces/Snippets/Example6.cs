using Contoso.Net;

public partial class Examples
{
    public async System.Threading.Tasks.Task Example6() {
        var client = new Contoso.Net.Contoso(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Scimconfiguration.CreatetokenAsync(
            new ScimConfigurationScimToken {
                TokenId = "tokenId",
                CreatedAt = "createdAt"
            }
        );
    }

}
