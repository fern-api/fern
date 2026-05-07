using NUnit.Framework;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.Noreqbody;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class PostwithnorequestbodyTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string mockResponse = """
            "string"
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/no-req-body").UsingPost())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Noreqbody.PostwithnorequestbodyAsync();
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string mockResponse = """
            "string"
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/no-req-body").UsingPost())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Noreqbody.PostwithnorequestbodyAsync();
        JsonAssert.AreEqual(response, mockResponse);
    }
}
