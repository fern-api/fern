using SeedObject;

namespace Usage;

public class Example0
{
    public async Task Do() {
        var client = new SeedObjectClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.GetRootAsync(
            new PostRootRequest {
                Bar = new RequestTypeInlineType1 {
                    Foo = "foo"
                },
                Foo = "foo"
            }
        );
    }

}
