using Contoso.Net;
using Contoso.Net.ScimConfiguration;

public partial class Examples
{
    public async System.Threading.Tasks.Task Example3() {
        var client = new ContosoClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.ScimConfiguration.CreateTokenAsync(
            new ScimToken {
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
