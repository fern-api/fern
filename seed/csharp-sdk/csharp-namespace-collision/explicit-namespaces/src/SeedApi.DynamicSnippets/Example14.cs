using Contoso.Net;
using Contoso.Net.System;

namespace Usage;

public class Example14
{
    public async System.Threading.Tasks.Task Do() {
        var client = new Contoso.Net.Contoso(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.System.GetuserAsync(
            new SystemGetUserRequest {
                UserId = "userId"
            }
        );
    }

}
