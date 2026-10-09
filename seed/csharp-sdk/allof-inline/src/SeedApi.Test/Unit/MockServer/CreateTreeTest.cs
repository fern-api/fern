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
              "id": "id",
              "treeName": "treeName",
              "treeDescription": "treeDescription",
              "treeSpecies": "treeSpecies",
              "heightInFeet": 1.1,
              "plantedDate": "2023-01-15"
            }
            """;

        const string mockResponse = """
            {
              "id": "id",
              "treeName": "treeName",
              "treeDescription": "treeDescription",
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
                Id = "id",
                TreeName = "treeName",
                TreeDescription = "treeDescription",
                TreeSpecies = "treeSpecies",
                HeightInFeet = 1.1,
                PlantedDate = new DateOnly(2023, 1, 15),
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string requestJson = """
            {
              "id": "id",
              "treeName": "treeName",
              "treeSpecies": "treeSpecies"
            }
            """;

        const string mockResponse = """
            {
              "id": "id",
              "treeName": "treeName",
              "treeDescription": "treeDescription",
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
                Id = "id",
                TreeName = "treeName",
                TreeSpecies = "treeSpecies",
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
