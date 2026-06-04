using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class CreateTreeTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string requestJson = """
            {
              "plantedDate": "2023-01-15",
              "treeSpecies": "treeSpecies",
              "heightInFeet": 1.1,
              "id": "id",
              "treeName": "treeName",
              "treeDescription": "treeDescription"
            }
            """;

        const string mockResponse = """
            {
              "plantedDate": "2023-01-15",
              "treeSpecies": "treeSpecies",
              "heightInFeet": 1.1,
              "id": "id",
              "treeName": "treeName",
              "treeDescription": "treeDescription"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/trees")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.CreateTreeAsync(
            new TreeRecord
            {
                PlantedDate = new DateOnly(2023, 1, 15),
                TreeSpecies = "treeSpecies",
                HeightInFeet = 1.1,
                Id = "id",
                TreeName = "treeName",
                TreeDescription = "treeDescription",
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string requestJson = """
            {
              "id": "id"
            }
            """;

        const string mockResponse = """
            {
              "treeName": "treeName",
              "treeDescription": "treeDescription",
              "id": "id",
              "treeSpecies": "treeSpecies",
              "heightInFeet": 1.1,
              "plantedDate": "2023-01-15"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/trees")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.CreateTreeAsync(new TreeRecord { Id = "id" });
        JsonAssert.AreEqual(response, mockResponse);
    }
}
