using NUnit.Framework;
using System.Threading.Tasks;
using SeedPagination;

    namespace SeedPagination.Test.Unit.MockServer;

[TestFixture]
public class ListWithGlobalConfigTest : BaseMockServerTest
{
    [Test]
    public async Task MockServerTest() {

        const string mockResponse = """
        {
          "results": [
            "results",
            "results"
          ]
        }
        """;

        Server.Given(WireMock.RequestBuilders.Request.Create().WithPath("/users").WithParam("offset", "1").UsingGet())

        .RespondWith(WireMock.ResponseBuilders.Response.Create()
        .WithStatusCode(200)
        .WithBody(mockResponse));

        var pager = Client.Users.ListWithGlobalConfigAsync(new ListWithGlobalConfigRequest{ 
                Offset = 1
            }, RequestOptions);
        await foreach (var item in pager)
        {
            Assert.That(item, Is.Not.Null);
            break; // Only check the first item
        }}

}
