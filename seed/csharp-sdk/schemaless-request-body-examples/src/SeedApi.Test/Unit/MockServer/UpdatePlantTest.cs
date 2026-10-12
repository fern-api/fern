using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class UpdatePlantTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
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
