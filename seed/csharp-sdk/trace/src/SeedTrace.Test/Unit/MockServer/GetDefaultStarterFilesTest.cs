using global::System.Threading.Tasks;
using NUnit.Framework;
using SeedTrace;
using SeedTrace.Core;

namespace SeedTrace.Test.Unit.MockServer;

[TestFixture]
public class GetDefaultStarterFilesTest : BaseMockServerTest
{
    [Test]
    public async global::System.Threading.Tasks.Task MockServerTest()
    {
        const string requestJson = """
            {
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
              "methodName": "methodName"
            }
            """;

        const string mockResponse = """
            {
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
              }
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/problem-crud/default-starter-files")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Problem.GetDefaultStarterFilesAsync(
            new GetDefaultStarterFilesRequest
            {
                InputParams = new List<VariableTypeAndName>()
                {
                    new VariableTypeAndName { VariableType = "no-properties-union", Name = "name" },
                    new VariableTypeAndName { VariableType = "no-properties-union", Name = "name" },
                },
                OutputType = "no-properties-union",
                MethodName = "methodName",
            },
            RequestOptions
        );
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<GetDefaultStarterFilesResponse>(mockResponse))
                .UsingPropertiesComparer()
        );
    }
}
