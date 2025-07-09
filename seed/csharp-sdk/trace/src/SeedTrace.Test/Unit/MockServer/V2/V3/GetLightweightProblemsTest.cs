using global::System.Threading.Tasks;
using NUnit.Framework;
using SeedTrace.Core;
using SeedTrace.Test.Unit.MockServer;
using SeedTrace.V2.V3;

namespace SeedTrace.Test.Unit.MockServer.V2.V3;

[TestFixture]
public class GetLightweightProblemsTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async global::System.Threading.Tasks.Task MockServerTest()
    {
        const string mockResponse = """
            [
              {
                "problemId": "problemId",
                "problemName": "problemName",
                "problemVersion": 1,
                "variableTypes": [
                  {
                    "type": "integerType"
                  }
                ]
              },
              {
                "problemId": "problemId",
                "problemName": "problemName",
                "problemVersion": 1,
                "variableTypes": [
                  {
                    "type": "integerType"
                  }
                ]
              }
            ]
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/problems-v2/lightweight-problem-info")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.V2.V3.Problem.GetLightweightProblemsAsync();
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<IEnumerable<LightweightProblemInfoV2>>(mockResponse))
                .UsingDefaults()
        );
    }
}
