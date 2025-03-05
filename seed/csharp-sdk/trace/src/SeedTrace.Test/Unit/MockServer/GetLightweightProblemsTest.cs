using global::System.Threading.Tasks;
using NUnit.Framework;
using SeedTrace.Core;

namespace SeedTrace.Test.Unit.MockServer;

[TestFixture]
public class GetLightweightProblemsTest : BaseMockServerTest
{
    [Test]
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

        var response = await Client.V2.V3.Problem.GetLightweightProblemsAsync(RequestOptions);
        Assert.That(
            response,
            Is.EqualTo(
                    JsonUtils.Deserialize<IEnumerable<V2.V3.LightweightProblemInfoV2>>(mockResponse)
                )
                .UsingPropertiesComparer()
        );
    }
}
