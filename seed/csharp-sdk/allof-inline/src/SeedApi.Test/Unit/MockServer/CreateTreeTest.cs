using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class CreateTreeTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
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
