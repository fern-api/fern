using SeedApi;
using SeedApi.Core;

namespace Usage;

public class Example106
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Inlinedrequests.PostwithobjectbodyandresponseAsync(
            new InlinedRequestsPostWithObjectBodyandResponseRequest {
                String = "string",
                Integer = 1,
                NestedObject = new TypesObjectWithOptionalField()
            }
        );
    }

}
