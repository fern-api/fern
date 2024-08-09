using NUnit.Framework;
using SeedTrace;
using SeedTrace.Core;
using SeedTrace.Test.Utils;
using SeedTrace.Test.Wire;

#nullable enable

namespace SeedTrace.Test;

[TestFixture]
public class UpdateProblemTest : BaseWireTest
{
    [Test]
    public void WireTest()
    {
        const string requestJson = """
            {
              "problemName": "string",
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
              "files": {
                "string": {
                  "solutionFile": {
                    "filename": "string",
                    "contents": "string"
                  },
                  "readOnlyFiles": [
                    {
                      "filename": "string",
                      "contents": "string"
                    }
                  ]
                }
              },
              "inputParams": [
                {
                  "variableType": {
                    "type": "integerType"
                  },
                  "name": "string"
                }
              ],
              "outputType": {
                "type": "integerType"
              },
              "testcases": [
                {
                  "testCase": {
                    "id": "string",
                    "params": [
                      {
                        "type": "integerValue"
                      }
                    ]
                  },
                  "expectedResult": {
                    "type": "integerValue"
                  }
                }
              ],
              "methodName": "string"
            }
            """;

        const string mockResponse = """
            {
              "problemVersion": 1
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/problem-crud/update/string")
                    .UsingPost()
                    .WithBody(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = Client
            .Problem.UpdateProblemAsync(
                "string",
                new CreateProblemRequest
                {
                    ProblemName = "string",
                    ProblemDescription = new ProblemDescription
                    {
                        Boards = new List<object>() { "string" }
                    },
                    Files = new Dictionary<Language, ProblemFiles>()
                    {
                        {
                            Language.Java,
                            new ProblemFiles
                            {
                                SolutionFile = new FileInfo
                                {
                                    Filename = "string",
                                    Contents = "string"
                                },
                                ReadOnlyFiles = new List<FileInfo>()
                                {
                                    new FileInfo { Filename = "string", Contents = "string" }
                                }
                            }
                        },
                    },
                    InputParams = new List<VariableTypeAndName>()
                    {
                        new VariableTypeAndName
                        {
                            VariableType = "no-properties-union",
                            Name = "string"
                        }
                    },
                    OutputType = "no-properties-union",
                    Testcases = new List<TestCaseWithExpectedResult>()
                    {
                        new TestCaseWithExpectedResult
                        {
                            TestCase = new TestCase
                            {
                                Id = "string",
                                Params = new List<object>() { 1 }
                            },
                            ExpectedResult = 1
                        }
                    },
                    MethodName = "string"
                }
            )
            .Result;
        JsonDiffChecker.AssertJsonEquals(mockResponse, JsonUtils.Serialize(response));
    }
}
