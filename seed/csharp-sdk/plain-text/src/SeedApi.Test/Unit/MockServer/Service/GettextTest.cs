using NUnit.Framework;
using SeedApi.Test.Unit.MockServer;

namespace SeedApi.Test.Unit.MockServer.Service;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GettextTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string mockResponse = "string";

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/text").UsingPost())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Service.GettextAsync();
        Assert.That(response, Is.EqualTo(mockResponse));
    }
}
