using NUnit.Framework;
using SeedTrace.Core;
using SeedTrace.Test.Utils;
using SeedTrace.Test.Wire;

#nullable enable

namespace SeedTrace.Test;

[TestFixture]
public class GetLightweightProblemsTest : BaseWireTest
{
    [Test]
    public void WireTest()
    {
        const string mockResponse = """
            [
              {
                "problemId": "string",
                "problemName": "string",
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

        var response = Client.V2.V3.Problem.GetLightweightProblemsAsync().Result;
        JsonDiffChecker.AssertJsonEquals(mockResponse, JsonUtils.Serialize(response));
    }
}
