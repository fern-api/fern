using NUnit.Framework;
using SeedBasicAuth.Core;
using SeedBasicAuth.Test.Utils;
using SeedBasicAuth.Test.Wire;

#nullable enable

namespace SeedBasicAuth.Test;

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
