using System.Threading.Tasks;
using NUnit.Framework;
using SeedPlainText.Test.Wire;

#nullable enable

namespace SeedPlainText.Test;

[TestFixture]
public class GetTextTest : BaseWireTest
{
    [Test]
    public async Task WireTest()
    {
        const string mockResponse = "string";

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/text").UsingPost())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBodyAsJson(mockResponse)
            );

        var response = await Client.Service.GetTextAsync(RequestOptions);
        Assert.That(response, Is.EqualTo(mockResponse));
    }
}
