using NUnit.Framework;
using SeedObject;

#nullable enable

namespace SeedObject.Test.Unit.MockServer;

[TestFixture]
public class GetDiscriminatedUnionTest : BaseMockServerTest
{
    [Test]
    public void MockServerTest()
    {
        const string requestJson = """
            {
              "bar": {
                "type": "type1",
                "foo": "foo",
                "bar": {
                  "foo": "foo",
                  "ref": {
                    "foo": "foo"
                  }
                },
                "ref": {
                  "foo": "foo"
                }
              },
              "foo": "foo"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/root/discriminated-union")
                    .WithHeader("Content-Type", "application/json")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(
            async () =>
                await Client.GetDiscriminatedUnionAsync(
                    new GetDiscriminatedUnionRequest
                    {
                        Bar = new DiscriminatedUnion1InlineType1
                        {
                            Foo = "foo",
                            Bar = new DiscriminatedUnion1InlineType1InlineType1
                            {
                                Foo = "foo",
                                Ref = new ReferenceType { Foo = "foo" },
                            },
                            Ref = new ReferenceType { Foo = "foo" },
                        },
                        Foo = "foo",
                    },
                    RequestOptions
                )
        );
    }
}
