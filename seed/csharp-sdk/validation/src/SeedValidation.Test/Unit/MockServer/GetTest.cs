using NUnit.Framework;
using SeedValidation;
using SeedValidation.Core;

namespace SeedValidation.Test.Unit.MockServer;

[TestFixture]
public class GetTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string mockResponse = """
            {
              "decimal": 2.2,
              "even": 100,
              "name": "fern",
              "shape": "SQUARE"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/")
                    .WithParam("decimal", "2.2")
                    .WithParam("even", "100")
                    .WithParam("name", "fern")
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
                Decimal = 2.2,
                Even = 100,
                Name = "fern",
            }
        );
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<SeedValidation.Type>(mockResponse)).UsingDefaults()
        );
    }
}
