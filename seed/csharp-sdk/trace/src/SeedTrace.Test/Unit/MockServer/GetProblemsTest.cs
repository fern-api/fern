using System.Threading.Tasks;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedTrace.Core;

#nullable enable

namespace SeedTrace.Test.Unit.MockServer;

[TestFixture]
public class GetProblemsTest : BaseMockServerTest
{
    [Test]
    public async Task MockServerTest()
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
                "generatedFiles": {
                  "generatedTestCaseFiles": {
                    "string": {
                      "files": [
                        {
                          "key": "value"
                        }
                      ]
                    }
                  },
                  "generatedTemplateFiles": {
                    "string": {
                      "files": [
                        {
                          "key": "value"
                        }
                      ]
                    }
                  },
                  "other": {
                    "string": {
                      "files": [
                        {
                          "key": "value"
                        }
                      ]
                    }
                  }
                },
                "customTestCaseTemplates": [
                  {
                    "templateId": "string",
                    "name": "string",
                    "implementation": {
                      "description": {
                        "boards": [
                          {
                            "type": "html",
                            "key": "value"
                          }
                        ]
                      },
                      "function": {
                        "type": "withActualResult"
                      }
                    }
                  }
                ],
                "testcases": [
                  {
                    "metadata": {
                      "id": "string",
                      "name": "string",
                      "hidden": true
                    },
                    "implementation": {
                      "0": "s",
                      "1": "t",
                      "2": "r",
                      "3": "i",
                      "4": "n",
                      "5": "g",
                      "type": "templateId"
                    },
                    "arguments": {
                      "string": {
                        "type": "integerValue",
                        "key": "value"
                      }
                    },
                    "expects": {
                      "expectedStdout": {
                        "key": "value"
                      }
                    }
                  }
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

        var response = await Client.V2.V3.Problem.GetProblemsAsync(RequestOptions);
        JToken
            .Parse(mockResponse)
            .Should()
            .BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }
}
