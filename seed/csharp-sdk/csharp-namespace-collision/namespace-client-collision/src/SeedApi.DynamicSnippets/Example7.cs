using Contoso.Net;

namespace Usage;

public class Example7
{
    public async System.Threading.Tasks.Task Do() {
        var client = new Contoso.Net.Contoso(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Scimconfiguration.CreatetokenAsync(
            new ScimConfigurationScimToken {
                TokenId = "tokenId",
                Token = "token",
                Scopes = new List<string>(){
                    "scopes",
                    "scopes",
                }
                ,
                CreatedAt = "createdAt"
            }
        );
    }

}
