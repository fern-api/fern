using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedTrace;
using SeedTrace.Test.Wire;

#nullable enable

namespace SeedTrace.Test;

[TestFixture]
public class GetDefaultStarterFilesTest : BaseWireTest
{
    [Test]
    public void WireTest()
    {
        const string requestJson = """
            {
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
              "methodName": "string"
            }
            """;

        const string mockResponse = """
            {
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
              }
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/problem-crud/default-starter-files")
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
            .Problem.GetDefaultStarterFilesAsync(
                new GetDefaultStarterFilesRequest
                {
                    InputParams = new List<VariableTypeAndName>()
                    {
                        new VariableTypeAndName
                        {
                            VariableType = "no-properties-union",
                            Name = "string"
                        }
                    },
                    OutputType = "no-properties-union",
                    MethodName = "string"
                }
            )
            .Result;
        JToken.Parse(serializedJson).Should().BeEquivalentTo(JToken.Parse(response));
    }
}
