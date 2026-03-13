using NUnit.Framework;
using SeedBasicAuthEnvironmentVariables.Test.Unit.MockServer;
using SeedBasicAuthEnvironmentVariables.Test.Utils;

namespace SeedBasicAuthEnvironmentVariables.Test.Unit.MockServer.BasicAuth;

[TestFixture]
public class GetWithBasicAuthTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
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

        var response = await Client.BasicAuth.GetWithBasicAuthAsync();
        JsonAssert.AreEqual(response, mockResponse);
    }
}
