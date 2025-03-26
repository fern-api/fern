using global::System.Threading.Tasks;
using NUnit.Framework;

namespace SeedPlainText.Test.Unit.MockServer;

[TestFixture]
public class GetTextTest : BaseMockServerTest
{
    [Test]
    public async global::System.Threading.Tasks.Task MockServerTest()
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

        var response = await Client.Service.GetTextAsync(RequestOptions);
        Assert.That(response, Is.EqualTo(mockResponse));
    }
}
