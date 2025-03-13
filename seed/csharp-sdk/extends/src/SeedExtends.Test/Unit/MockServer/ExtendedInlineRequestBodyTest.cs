using NUnit.Framework;
using SeedExtends;

namespace SeedExtends.Test.Unit.MockServer;

[TestFixture]
public class ExtendedInlineRequestBodyTest : BaseMockServerTest
{
    [Test]
    public void MockServerTest()
    {
        const string requestJson = """
            {
              "docs": "docs",
              "name": "name",
              "unique": "unique"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/extends/extended-inline-request-body")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(
            async () =>
                await Client.ExtendedInlineRequestBodyAsync(
                    new Inlined { Unique = "unique" },
                    RequestOptions
                )
        );
    }
}
