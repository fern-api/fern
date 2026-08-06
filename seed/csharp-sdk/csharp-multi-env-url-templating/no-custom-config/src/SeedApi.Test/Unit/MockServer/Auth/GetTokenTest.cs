using NUnit.Framework;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.Auth;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GetTokenTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string mockResponse = """
            {
              "access_token": "access_token"
            }
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/token").UsingPost())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Auth.GetTokenAsync();
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string mockResponse = """
            {
              "access_token": "access_token"
            }
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/token").UsingPost())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Auth.GetTokenAsync();
        JsonAssert.AreEqual(response, mockResponse);
    }
}
