using SeedObject;

namespace Usage;

public class Example1
{
    public async Task Do() {
        var client = new SeedObjectClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.GetDiscriminatedUnionAsync(
            new GetDiscriminatedUnionRequest {
                Bar = new DiscriminatedUnion1(
                    new DiscriminatedUnion1InlineType1 {
                        Foo = "foo",
                        Bar = new DiscriminatedUnion1InlineType1InlineType1 {
                            Foo = "foo",
                            Ref = new ReferenceType {
                                Foo = "foo"
                            }
                        },
                        Ref = new ReferenceType {
                            Foo = "foo"
                        }
                    }
                ),
                Foo = "foo"
            }
        );
    }

}
