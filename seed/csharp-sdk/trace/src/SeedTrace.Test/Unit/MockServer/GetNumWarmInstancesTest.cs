using NUnit.Framework;
using System.Threading.Tasks;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using SeedTrace.Core;

    namespace SeedTrace.Test.Unit.MockServer;

[TestFixture]
public class GetNumWarmInstancesTest : BaseMockServerTest
{
    [Test]
    public async Task MockServerTest() {

        const string mockResponse = """
        {
          "JAVA": 1
        }
        """;

        Server.Given(WireMock.RequestBuilders.Request.Create().WithPath("/sysprop/num-warm-instances").UsingGet())

        .RespondWith(WireMock.ResponseBuilders.Response.Create()
        .WithStatusCode(200)
        .WithBody(mockResponse));

        var response = await Client.Sysprop.GetNumWarmInstancesAsync(RequestOptions);
        JToken.Parse(mockResponse).Should().BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }

}
