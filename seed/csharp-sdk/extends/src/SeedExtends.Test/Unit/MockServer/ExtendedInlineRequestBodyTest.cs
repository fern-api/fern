using NUnit.Framework;
using SeedExtends;
using SeedExtends.Test.Unit.MockServer;

#nullable enable

namespace SeedExtends.Test;

[TestFixture]
public class ExtendedInlineRequestBodyTest : BaseMockServerTest
{
    [Test]
    public void MockServerTest()
    {
        const string requestJson = """
            {
              "unique": "string",
              "name": "string",
              "docs": "string"
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
                    new Inlined
                    {
                        Unique = "string",
                        Name = "string",
                        Docs = "string",
                    },
                    RequestOptions
                )
        );
    }
}
