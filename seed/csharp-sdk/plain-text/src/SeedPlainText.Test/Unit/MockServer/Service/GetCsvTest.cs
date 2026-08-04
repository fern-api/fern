using NUnit.Framework;
using SeedPlainText.Test.Unit.MockServer;

namespace SeedPlainText.Test.Unit.MockServer.Service;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GetCsvTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string mockResponse = "string";

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/csv").UsingGet())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Service.GetCsvAsync();
        Assert.That(response, Is.EqualTo(mockResponse));
    }
}
