using SeedCsharpNamespaceCollision;
using SeedCsharpNamespaceCollision.ScimConfiguration;

namespace Usage;

public class Example3
{
    public async System.Threading.Tasks.Task Do() {
        var client = new SeedCsharpNamespaceCollisionClient(
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
