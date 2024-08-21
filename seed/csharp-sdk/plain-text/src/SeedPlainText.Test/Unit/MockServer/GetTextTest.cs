using System.Threading.Tasks;
using NUnit.Framework;
using SeedPlainText.Test.Unit.MockServer;

#nullable enable

namespace SeedPlainText.Test;

[TestFixture]
public class GetTextTest : BaseMockServerTest
{
    [Test]
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

        var response = await Client.Service.GetTextAsync(RequestOptions);
        Assert.That(response, Is.EqualTo(mockResponse));
    }
}
