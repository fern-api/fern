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
              "name": "name",
              "patient": {
                "resource_type": "Patient",
                "name": "name",
                "scripts": [
                  {
                    "resource_type": "Script",
                    "name": "name"
                  },
                  {
                    "resource_type": "Script",
                    "name": "name"
                  }
                ]
              },
              "practitioner": {
                "resource_type": "Practitioner",
                "name": "name"
              }
            }
            """;

        Server
            .Given(
                WireMock.RequestBuilders.Request.Create().WithPath("/account/account_id").UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.GetAccountAsync("account_id", RequestOptions);
        JToken
            .Parse(mockResponse)
            .Should()
            .BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }
}
