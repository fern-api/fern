using NUnit.Framework;
using System.Threading.Tasks;
using SeedValidation;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using SeedValidation.Core;

    namespace SeedValidation.Test.Unit.MockServer;

[TestFixture]
public class CreateTest : BaseMockServerTest
{
    [Test]
    public async Task MockServerTest() {
        const string requestJson = """
        {
          "decimal": 2.2,
          "even": 100,
          "name": "foo",
          "shape": "SQUARE"
        }
        """;

        const string mockResponse = """
        {
          "decimal": 2.2,
          "even": 100,
          "name": "foo",
          "shape": "SQUARE"
        }
        """;

        Server.Given(WireMock.RequestBuilders.Request.Create().WithPath("/create").UsingPost().WithBodyAsJson(requestJson))

        .RespondWith(WireMock.ResponseBuilders.Response.Create()
        .WithStatusCode(200)
        .WithBody(mockResponse));

        var response = await Client.CreateAsync(new CreateRequest{ 
                Decimal = 2.2, Even = 100, Name = "foo", Shape = Shape.Square
            }, RequestOptions);
        JToken.Parse(mockResponse).Should().BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }

}
