using System.Threading.Tasks;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedValidation;
using SeedValidation.Core;

#nullable enable

namespace SeedValidation.Test.Unit.MockServer;

[TestFixture]
public class GetTest : BaseMockServerTest
{
    [Test]
    public async Task MockServerTest()
    {
        const string mockResponse = """
            {
              "decimal": 1.1,
              "even": 2,
              "name": "rules",
              "shape": "SQUARE"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/")
                    .WithParam("decimal", "1.1")
                    .WithParam("even", "1")
                    .WithParam("name", "string")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.GetAsync(
            new GetRequest
            {
                Decimal = 1.1d,
                Even = 1,
                Name = "string",
            },
            RequestOptions
        );
        JToken
            .Parse(mockResponse)
            .Should()
            .BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }
}
