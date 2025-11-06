using NUnit.Framework;
using SeedTrace;
using SeedTrace.Core;

namespace SeedTrace.Test_.Unit.MockServer;

[TestFixture]
public class GetDefaultStarterFilesTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
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
                MethodName = "methodName",
            }
        );
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<GetDefaultStarterFilesResponse>(mockResponse))
                .UsingDefaults()
        );
    }
}
