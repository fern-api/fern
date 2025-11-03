using NUnit.Framework;
using SeedTrace;
using SeedTrace.Core;

namespace SeedTrace.Test_.Unit.MockServer;

[TestFixture]
public class CreateProblemTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string requestJson = """
            {
              "problemName": "problemName",
              "problemDescription": {
                "boards": [
                  {
                    "type": "html",
                    "value": "boards"
                  },
                  {
                    "type": "html",
                    "value": "boards"
                  }
                ]
              },
              "files": {
                "JAVA": {
                  "solutionFile": {
                    "filename": "filename",
                    "contents": "contents"
                  },
                  "readOnlyFiles": [
                    {
                      "filename": "filename",
                      "contents": "contents"
                    },
                    {
                      "filename": "filename",
                      "contents": "contents"
                    }
                  ]
                }
              },
              "inputParams": [
                {
                  "variableType": {
                    "type": "integerType"
                  },
                  "name": "name"
                },
                {
                  "variableType": {
                    "type": "integerType"
                  },
                  "name": "name"
                }
              ],
              "outputType": {
                "type": "integerType"
              },
              "testcases": [
                {
                  "testCase": {
                    "id": "id",
                    "params": [
                      {
                        "type": "integerValue",
                        "value": 1
                      },
                      {
                        "type": "integerValue",
                        "value": 1
                      }
                    ]
                  },
                  "expectedResult": {
                    "type": "integerValue",
                    "value": 1
                  }
                },
                {
                  "testCase": {
                    "id": "id",
                    "params": [
                      {
                        "type": "integerValue",
                        "value": 1
                      },
                      {
                        "type": "integerValue",
                        "value": 1
                      }
                    ]
                  },
                  "expectedResult": {
                    "type": "integerValue",
                    "value": 1
                  }
                }
              ],
              "methodName": "methodName"
            }
            """;

        const string mockResponse = """
            {
              "type": "success",
              "value": "string"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/problem-crud/create")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Problem.CreateProblemAsync(
            new CreateProblemRequest
            {
                ProblemName = "problemName",
                ProblemDescription = new ProblemDescription
                {
                    Boards = new List<ProblemDescriptionBoard>()
                    {
                        new ProblemDescriptionBoard(new ProblemDescriptionBoard.Html("boards")),
                        new ProblemDescriptionBoard(new ProblemDescriptionBoard.Html("boards")),
                    },
                },
                Files = new Dictionary<Language, ProblemFiles>()
                {
                    {
                        Language.Java,
                        new ProblemFiles
                        {
                            SolutionFile = new SeedTrace.FileInfo
                            {
                                Filename = "filename",
                                Contents = "contents",
                            },
                            ReadOnlyFiles = new List<SeedTrace.FileInfo>()
                            {
                                new SeedTrace.FileInfo
                                {
                                    Filename = "filename",
                                    Contents = "contents",
                                },
                                new SeedTrace.FileInfo
                                {
                                    Filename = "filename",
                                    Contents = "contents",
                                },
                            },
                        }
                    },
                },
                InputParams = new List<VariableTypeAndName>()
                {
                    new VariableTypeAndName
                    {
                        VariableType = new VariableType(new VariableType.IntegerType()),
                        Name = "name",
                    },
                    new VariableTypeAndName
                    {
                        VariableType = new VariableType(new VariableType.IntegerType()),
                        Name = "name",
                    },
                },
                OutputType = new VariableType(new VariableType.IntegerType()),
                Testcases = new List<TestCaseWithExpectedResult>()
                {
                    new TestCaseWithExpectedResult
                    {
                        TestCase = new TestCase
                        {
                            Id = "id",
                            Params = new List<VariableValue>()
                            {
                                new VariableValue(new VariableValue.IntegerValue(1)),
                                new VariableValue(new VariableValue.IntegerValue(1)),
                            },
                        },
                        ExpectedResult = new VariableValue(new VariableValue.IntegerValue(1)),
                    },
                    new TestCaseWithExpectedResult
                    {
                        TestCase = new TestCase
                        {
                            Id = "id",
                            Params = new List<VariableValue>()
                            {
                                new VariableValue(new VariableValue.IntegerValue(1)),
                                new VariableValue(new VariableValue.IntegerValue(1)),
                            },
                        },
                        ExpectedResult = new VariableValue(new VariableValue.IntegerValue(1)),
                    },
                },
                MethodName = "methodName",
            }
        );
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<CreateProblemResponse>(mockResponse)).UsingDefaults()
        );
    }
}
