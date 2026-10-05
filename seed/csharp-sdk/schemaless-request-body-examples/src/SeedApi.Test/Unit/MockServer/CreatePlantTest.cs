using NUnit.Framework;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class CreatePlantTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string requestJson = """
            {
              "name": "Venus Flytrap",
              "species": "Dionaea muscipula",
              "care": {
                "light": "full sun",
                "water": "distilled only",
                "humidity": "high"
              },
              "tags": [
                "carnivorous",
                "tropical"
              ]
            }
            """;

        const string mockResponse = """
            {
              "id": "plant_123",
              "name": "Venus Flytrap"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/plants")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.CreatePlantAsync(
            new Dictionary<object, object?>()
            {
                {
                    "care",
                    new Dictionary<object, object?>()
                    {
                        { "humidity", "high" },
                        { "light", "full sun" },
                        { "water", "distilled only" },
                    }
                },
                { "name", "Venus Flytrap" },
                { "species", "Dionaea muscipula" },
                {
                    "tags",
                    new List<object?>() { "carnivorous", "tropical" }
                },
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
