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
