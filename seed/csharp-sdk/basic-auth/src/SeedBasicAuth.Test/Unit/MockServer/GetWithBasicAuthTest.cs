using NUnit.Framework;
using System.Threading.Tasks;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using SeedBasicAuth.Core;

    namespace SeedBasicAuth.Test.Unit.MockServer;

[TestFixture]
public class GetWithBasicAuthTest : BaseMockServerTest
{
    [Test]
    public async Task MockServerTest() {

        const string mockResponse = """
        true
        """;

        Server.Given(WireMock.RequestBuilders.Request.Create().WithPath("/basic-auth").UsingGet())

        .RespondWith(WireMock.ResponseBuilders.Response.Create()
        .WithStatusCode(200)
        .WithBody(mockResponse));

        var response = await Client.BasicAuth.GetWithBasicAuthAsync(RequestOptions);
        JToken.Parse(mockResponse).Should().BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }

}
