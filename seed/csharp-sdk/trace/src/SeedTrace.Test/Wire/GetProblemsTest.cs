using NUnit.Framework;
using SeedTrace.Core;
using SeedTrace.Test.Utils;
using SeedTrace.Test.Wire;

#nullable enable

namespace SeedTrace.Test;

[TestFixture]
public class GetProblemsTest : BaseWireTest
{
    [Test]
    public void WireTest()
    {
        const string mockResponse = """
            [
              {
                "problemId": "string",
                "problemDescription": {
                  "boards": [
                    {
                      "0": "s",
                      "1": "t",
                      "2": "r",
                      "3": "i",
                      "4": "n",
                      "5": "g",
                      "type": "html"
                    }
                  ]
                },
                "problemName": "string",
                "problemVersion": 1,
                "supportedLanguages": [
                  "JAVA"
                ],
                "customFiles": {
                  "type": "basic"
                },
                "generatedFiles": {},
                "customTestCaseTemplates": [
                  {}
                ],
                "testcases": [
                  {}
                ],
                "isPublic": true
              }
            ]
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/problems-v2/problem-info")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = Client.V2.V3.Problem.GetProblemsAsync().Result;
        JsonDiffChecker.AssertJsonEquals(mockResponse, JsonUtils.Serialize(response));
    }
}
