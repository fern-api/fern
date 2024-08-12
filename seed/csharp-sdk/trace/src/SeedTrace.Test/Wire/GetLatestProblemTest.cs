using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedTrace.Test.Wire;

#nullable enable

namespace SeedTrace.Test;

[TestFixture]
public class GetLatestProblemTest : BaseWireTest
{
    [Test]
    public void WireTest()
    {
        const string mockResponse = """
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
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/problems-v2/problem-info/string")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = Client.V2.V3.Problem.GetLatestProblemAsync("string").Result;
        JToken.Parse(serializedJson).Should().BeEquivalentTo(JToken.Parse(response));
    }
}
