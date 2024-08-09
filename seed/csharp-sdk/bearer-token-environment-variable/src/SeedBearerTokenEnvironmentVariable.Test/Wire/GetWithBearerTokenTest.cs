using NUnit.Framework;
using SeedBearerTokenEnvironmentVariable.Core;
using SeedBearerTokenEnvironmentVariable.Test.Utils;
using SeedBearerTokenEnvironmentVariable.Test.Wire;

#nullable enable

namespace SeedBearerTokenEnvironmentVariable.Test;

[TestFixture]
public class GetWithBearerTokenTest : BaseWireTest
{
    [Test]
    public void WireTest()
    {
        const string mockResponse = """
            "string"
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/apiKey").UsingGet())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = Client.Service.GetWithBearerTokenAsync().Result;
        JsonDiffChecker.AssertJsonEquals(mockResponse, JsonUtils.Serialize(response));
    }
}
