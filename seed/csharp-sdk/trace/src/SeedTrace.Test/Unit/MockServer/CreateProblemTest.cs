using System.Threading.Tasks;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedTrace;
using SeedTrace.Core;

namespace SeedTrace.Test.Unit.MockServer;

[TestFixture]
public class CreateProblemTest : BaseMockServerTest
{
    [Test]
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
                    Boards = new List<object>() { "boards", "boards" },
                },
                Files = new Dictionary<Language, ProblemFiles>()
                {
                    {
                        Language.Java,
                        new ProblemFiles
                        {
                            SolutionFile = new FileInfo
                            {
                                Filename = "filename",
                                Contents = "contents",
                            },
                            ReadOnlyFiles = new List<FileInfo>()
                            {
                                new FileInfo { Filename = "filename", Contents = "contents" },
                                new FileInfo { Filename = "filename", Contents = "contents" },
                            },
                        }
                    },
                },
                InputParams = new List<VariableTypeAndName>()
                {
                    new VariableTypeAndName { VariableType = "no-properties-union", Name = "name" },
                    new VariableTypeAndName { VariableType = "no-properties-union", Name = "name" },
                },
                OutputType = "no-properties-union",
                Testcases = new List<TestCaseWithExpectedResult>()
                {
                    new TestCaseWithExpectedResult
                    {
                        TestCase = new TestCase
                        {
                            Id = "id",
                            Params = new List<object>() { 1, 1 },
                        },
                        ExpectedResult = 1,
                    },
                    new TestCaseWithExpectedResult
                    {
                        TestCase = new TestCase
                        {
                            Id = "id",
                            Params = new List<object>() { 1, 1 },
                        },
                        ExpectedResult = 1,
                    },
                },
                MethodName = "methodName",
            },
            RequestOptions
        );
        JToken
            .Parse(mockResponse)
            .Should()
            .BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }
}
