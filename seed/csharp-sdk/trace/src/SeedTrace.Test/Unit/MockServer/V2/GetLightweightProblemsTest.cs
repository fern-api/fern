using NUnit.Framework;
using SeedTrace.Core;
using SeedTrace.Test_.Unit.MockServer;

namespace SeedTrace.Test_.Unit.MockServer.V2;

[TestFixture]
public class GetLightweightProblemsTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
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

        var response = await Client.V2.Problem.GetLightweightProblemsAsync();
        Assert.That(
            response,
            Is.EqualTo(
                    JsonUtils.Deserialize<IEnumerable<SeedTrace.V2.LightweightProblemInfoV2>>(
                        mockResponse
                    )
                )
                .UsingDefaults()
        );
    }
}
