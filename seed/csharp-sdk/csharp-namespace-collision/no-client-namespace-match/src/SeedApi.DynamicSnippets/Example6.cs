using Contoso.Net;

namespace Usage;

public class Example6
{
    public async System.Threading.Tasks.Task Do() {
        var client = new ContosoClient(
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
