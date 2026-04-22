using NUnit.Framework;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class CreatePlantTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string requestJson = """
            {
              "key": "value"
            }
            """;

        const string mockResponse = """
            {
              "id": "id",
              "name": "name"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/plants")
                    .WithHeader("Content-Type", "application/json")
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
            new Dictionary<object, object?>() { { "key", "value" } }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
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
                    .WithHeader("Content-Type", "application/json")
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
