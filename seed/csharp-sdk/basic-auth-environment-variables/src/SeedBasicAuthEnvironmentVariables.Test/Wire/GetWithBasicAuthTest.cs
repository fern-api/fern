using NUnit.Framework;
using SeedBasicAuthEnvironmentVariables.Core;
using SeedBasicAuthEnvironmentVariables.Test.Utils;
using SeedBasicAuthEnvironmentVariables.Test.Wire;

#nullable enable

namespace SeedBasicAuthEnvironmentVariables.Test;

[TestFixture]
public class GetWithBasicAuthTest : BaseWireTest
{
    [Test]
    public void WireTest()
    {
        const string mockResponse = """
            true
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/basic-auth").UsingGet())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = Client.BasicAuth.GetWithBasicAuthAsync().Result;
        JsonDiffChecker.AssertJsonEquals(mockResponse, JsonUtils.Serialize(response));
    }
}
