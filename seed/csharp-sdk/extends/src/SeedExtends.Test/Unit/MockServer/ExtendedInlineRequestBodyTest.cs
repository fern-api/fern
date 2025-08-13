using NUnit.Framework;

namespace SeedExtends.Test.Unit.MockServer;

[TestFixture]
public class ExtendedInlineRequestBodyTest : BaseMockServerTest
{
    [Test]
    public void MockServerTest()
    {
        const string requestJson = """
            {
              "name": "name",
              "docs": "docs",
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

        Assert.DoesNotThrowAsync(async () =>
            await Client.ExtendedInlineRequestBodyAsync(
                new Inlined
                {
                    Unique = "unique",
                    Name = "name",
                    Docs = "docs",
                }
            )
        );
    }
}
