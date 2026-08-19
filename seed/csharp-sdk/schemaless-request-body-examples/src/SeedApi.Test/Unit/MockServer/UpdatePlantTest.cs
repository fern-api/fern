using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class UpdatePlantTest : BaseMockServerTest
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
                    .WithPath("/plants/plantId")
                    .WithHeader("Content-Type", "application/json")
                    .UsingPut()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.UpdatePlantAsync(
            new UpdatePlantRequest
            {
                PlantId = "plantId",
                Body = new Dictionary<object, object?>() { { "key", "value" } },
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string requestJson = """
            {
              "name": "Updated Venus Flytrap",
              "care": {
                "light": "partial shade"
              }
            }
            """;

        const string mockResponse = """
            {
              "id": "plant_123",
              "name": "Updated Venus Flytrap"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/plants/plantId")
                    .WithHeader("Content-Type", "application/json")
                    .UsingPut()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.UpdatePlantAsync(
            new UpdatePlantRequest
            {
                PlantId = "plantId",
                Body = new Dictionary<object, object?>()
                {
                    {
                        "care",
                        new Dictionary<object, object?>() { { "light", "partial shade" } }
                    },
                    { "name", "Updated Venus Flytrap" },
                },
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
