using SeedObject;

public partial class Examples
{
    public async Task Example2() {
        var client = new SeedObjectClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.GetUndiscriminatedUnionAsync(
            new GetUndiscriminatedUnionRequest {
                Bar = new UndiscriminatedUnion1InlineType1 {
                    Foo = "foo",
                    Bar = new UndiscriminatedUnion1InlineType1InlineType1 {
                        Foo = "foo",
                        Ref = new ReferenceType {
                            Foo = "foo"
                        }
                    },
                    Ref = new ReferenceType {
                        Foo = "foo"
                    }
                },
                Foo = "foo"
            }
        );
    }

}
