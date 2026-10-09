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
              "treeName": "treeName",
              "treeSpecies": "treeSpecies",
              "plantedDate": "2023-01-15",
              "heightInFeet": 1.1,
              "treeDescription": "treeDescription",
              "id": "id"
            }
            """;

        const string mockResponse = """
            {
              "treeName": "treeName",
              "treeSpecies": "treeSpecies",
              "plantedDate": "2023-01-15",
              "heightInFeet": 1.1,
              "treeDescription": "treeDescription",
              "id": "id"
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
                TreeName = "treeName",
                TreeSpecies = "treeSpecies",
                PlantedDate = new DateOnly(2023, 1, 15),
                HeightInFeet = 1.1,
                TreeDescription = "treeDescription",
                Id = "id",
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string requestJson = """
            {
              "treeName": "treeName",
              "id": "id",
              "treeSpecies": "treeSpecies"
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

        var response = await Client.CreateTreeAsync(
            new TreeRecord
            {
                TreeName = "treeName",
                Id = "id",
                TreeSpecies = "treeSpecies",
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
