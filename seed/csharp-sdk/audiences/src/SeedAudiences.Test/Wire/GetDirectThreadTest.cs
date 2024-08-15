using System.Threading.Tasks;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedAudiences.Core;
using SeedAudiences.Test.Wire;

#nullable enable

namespace SeedAudiences.Test;

[TestFixture]
public class GetDirectThreadTest : BaseWireTest
{
    [Test]
    public async Task WireTest()
    {
        const string mockResponse = """
            {
              "foo": {
                "foo": {
                  "bar_property": "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"
                }
              }
            }
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/").UsingGet())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.FolderA.Service.GetDirectThreadAsync(RequestOptions);
        JToken
            .Parse(mockResponse)
            .Should()
            .BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }
}
