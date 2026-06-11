using NUnit.Framework;
using SeedApi;
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
              "sunExposure": "full",
              "plantedAt": "2023-01-15",
              "soilType": "soilType",
              "commonName": "commonName",
              "wateringFrequency": "daily",
              "species": "species",
              "family": "family",
              "genus": "genus"
            }
            """;

        const string mockResponse = """
            {
              "species": "species",
              "family": "family",
              "genus": "genus"
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
            new PlantPost
            {
                SunExposure = PlantPostSunExposure.Full,
                PlantedAt = new DateOnly(2023, 1, 15),
                SoilType = "soilType",
                CommonName = "commonName",
                WateringFrequency = PlantBaseWateringFrequency.Daily,
                Species = "species",
                Family = "family",
                Genus = "genus",
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string requestJson = """
            {
              "species": "species",
              "family": "family",
              "genus": "genus",
              "sunExposure": "full"
            }
            """;

        const string mockResponse = """
            {
              "species": "species",
              "family": "family",
              "genus": "genus"
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
            new PlantPost
            {
                Species = "species",
                Family = "family",
                Genus = "genus",
                SunExposure = PlantPostSunExposure.Full,
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
