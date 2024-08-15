using NUnit.Framework;
using SeedAliasExtends;
using SeedAliasExtends.Test.Wire;

#nullable enable

namespace SeedAliasExtends.Test;

[TestFixture]
public class ExtendedInlineRequestBodyTest : BaseWireTest
{
    [Test]
    public void WireTest()
    {
        const string requestJson = """
            {
              "child": "string",
              "parent": "string"
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
                    new InlinedChildRequest { Child = "string", Parent = "string" },
                    RequestOptions
                )
        );
    }
}
