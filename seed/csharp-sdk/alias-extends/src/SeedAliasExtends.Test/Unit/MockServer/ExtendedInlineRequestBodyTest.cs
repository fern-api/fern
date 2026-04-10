using NUnit.Framework;
using SeedAliasExtends;

namespace SeedAliasExtends.Test.Unit.MockServer;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class ExtendedInlineRequestBodyTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public void MockServerTest()
    {
        const string requestJson = """
            {
              "child": "child",
              "parent": "parent"
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
                new InlinedChildRequest { Child = "child", Parent = "parent" }
            )
        );
    }
}
