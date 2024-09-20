using System.Threading.Tasks;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedApi.Core;

#nullable enable

namespace SeedApi.Test.Unit.MockServer;

[TestFixture]
public class GetAccountTest : BaseMockServerTest
{
    [Test]
    public async Task MockServerTest()
    {
        const string mockResponse = """
            {
              "resource_type": "Account",
              "name": "string",
              "patient": {
                "resource_type": "Patient",
                "name": "string",
                "scripts": [],
                "id": "string",
                "related_resources": [],
                "memo": {
                  "description": "string"
                }
              },
              "practitioner": {
                "resource_type": "Practitioner",
                "name": "string",
                "id": "string",
                "related_resources": [],
                "memo": {
                  "description": "string"
                }
              },
              "id": "string",
              "related_resources": [],
              "memo": {
                "description": "string"
              }
            }
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/account/string").UsingGet())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.GetAccountAsync("string", RequestOptions);
        JToken
            .Parse(mockResponse)
            .Should()
            .BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }
}
