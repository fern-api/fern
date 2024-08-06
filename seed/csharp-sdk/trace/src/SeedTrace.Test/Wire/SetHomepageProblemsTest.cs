using NUnit.Framework;
using SeedTrace.Test.Wire;

#nullable enable

namespace SeedTrace.Test;

[TestFixture]
public class SetHomepageProblemsTest : BaseWireTest
{
    [Test]
    public void WireTest()
    {
        const string requestJson = """
            [
              "string"
            ]
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/homepage-problems")
                    .UsingPost()
                    .WithBody(requestJson)
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrow(
            () =>
                Client
                    .Homepage.SetHomepageProblemsAsync(new List<string>() { "string" })
                    .GetAwaiter()
                    .GetResult()
        );
    }
}
