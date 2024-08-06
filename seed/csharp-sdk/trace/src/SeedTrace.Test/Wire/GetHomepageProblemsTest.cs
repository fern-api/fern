using NUnit.Framework;
using SeedTrace.Core;
using SeedTrace.Test.Utils;
using SeedTrace.Test.Wire;

#nullable enable

namespace SeedTrace.Test;

[TestFixture]
public class GetHomepageProblemsTest : BaseWireTest
{
    [Test]
    public void WireTest()
    {
        const string mockResponse = """
            [
              "string"
            ]
            """;

        Server
            .Given(
                WireMock.RequestBuilders.Request.Create().WithPath("/homepage-problems").UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = Client.Homepage.GetHomepageProblemsAsync().Result;
        JsonDiffChecker.AssertJsonEquals(mockResponse, JsonUtils.Serialize(response));
    }
}
