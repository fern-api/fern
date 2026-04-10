using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.Plants;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GetTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string mockResponse = """
            {
              "id": "id",
              "name": "name",
              "species": "species"
            }
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/plants/plantId").UsingGet())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Plants.GetAsync(new GetPlantsRequest { PlantId = "plantId" });
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string mockResponse = """
            {
              "id": "id",
              "name": "name",
              "species": "species"
            }
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/plants/plantId").UsingGet())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Plants.GetAsync(new GetPlantsRequest { PlantId = "plantId" });
        JsonAssert.AreEqual(response, mockResponse);
    }
}
