using System.Threading.Tasks;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedApi.Core;
using SeedApi.Test.Wire;

#nullable enable

namespace SeedApi.Test;

[TestFixture]
public class GetAccountTest : BaseWireTest
{
    [Test]
    public async Task WireTest()
    {
        const string mockResponse = """
            {
              "resource_type": "Account",
              "name": "string",
              "patient": {
                "resource_type": "Patient",
                "name": "string",
                "scripts": [
                  {
                    "key": "value"
                  }
                ],
                "id": "string",
                "related_resources": [
                  {
                    "key": "value"
                  }
                ],
                "memo": {
                  "description": "string",
                  "account": {
                    "key": "value"
                  }
                }
              },
              "practitioner": {
                "resource_type": "Practitioner",
                "name": "string",
                "id": "string",
                "related_resources": [
                  {
                    "key": "value"
                  }
                ],
                "memo": {
                  "description": "string",
                  "account": {
                    "key": "value"
                  }
                }
              },
              "id": "string",
              "related_resources": [
                {
                  "key": "value"
                }
              ],
              "memo": {
                "description": "string",
                "account": {
                  "key": "value"
                }
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
