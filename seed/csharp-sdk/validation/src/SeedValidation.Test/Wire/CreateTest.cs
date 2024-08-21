using System.Threading.Tasks;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedValidation;
using SeedValidation.Core;
using SeedValidation.Test.Wire;

#nullable enable

namespace SeedValidation.Test;

[TestFixture]
public class CreateTest : BaseWireTest
{
    [Test]
    public async Task WireTest()
    {
        const string requestJson = """
            {
              "decimal": 1.1,
              "even": 1,
              "name": "string",
              "shape": "SQUARE"
            }
            """;

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
                    .WithPath("/create")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.CreateAsync(
            new CreateRequest
            {
                Decimal = 1.1,
                Even = 1,
                Name = "string",
                Shape = Shape.Square,
            },
            RequestOptions
        );
        JToken
            .Parse(mockResponse)
            .Should()
            .BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }
}
