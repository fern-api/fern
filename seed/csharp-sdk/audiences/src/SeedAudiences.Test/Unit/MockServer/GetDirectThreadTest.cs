using System.Threading.Tasks;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedAudiences.Core;

namespace SeedAudiences.Test.Unit.MockServer;

[TestFixture]
public class GetDirectThreadTest : BaseMockServerTest
{
    [Test]
    public async Task MockServerTest()
    {
        const string mockResponse = """
            {
              "foo": "foo"
            }
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/partner-path").UsingGet())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.FolderD.Service.GetDirectThreadAsync(RequestOptions);
        JToken
            .Parse(mockResponse)
            .Should()
            .BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }
}
