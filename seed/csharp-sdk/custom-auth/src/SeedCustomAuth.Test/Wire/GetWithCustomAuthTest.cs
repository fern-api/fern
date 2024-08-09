using NUnit.Framework;
using SeedCustomAuth.Core;
using SeedCustomAuth.Test.Utils;
using SeedCustomAuth.Test.Wire;

#nullable enable

namespace SeedCustomAuth.Test;

[TestFixture]
public class GetWithCustomAuthTest : BaseWireTest
{
    [Test]
    public void WireTest()
    {
        const string mockResponse = """
            true
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/custom-auth").UsingGet())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = Client.CustomAuth.GetWithCustomAuthAsync().Result;
        JsonDiffChecker.AssertJsonEquals(mockResponse, JsonUtils.Serialize(response));
    }
}
