using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class CreateAstTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string requestJson = """
            {
              "type": "llm",
              "model": "model",
              "value_schema": {
                "value_schema": {
                  "key": "value"
                }
              },
              "prompt": "prompt"
            }
            """;

        const string mockResponse = """
            {
              "type": "llm",
              "model": "model",
              "value_schema": {
                "value_schema": {
                  "key": "value"
                }
              },
              "prompt": "prompt"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/ast")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.CreateAstAsync(
            new AstNode(
                new AstNode.Llm(
                    new AstNodeLlm
                    {
                        Model = "model",
                        ValueSchema = new Dictionary<string, object?>()
                        {
                            {
                                "value_schema",
                                new Dictionary<object, object?>() { { "key", "value" } }
                            },
                        },
                        Prompt = "prompt",
                    }
                )
            )
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string requestJson = """
            {
              "type": "llm",
              "model": "model"
            }
            """;

        const string mockResponse = """
            {
              "type": "llm",
              "model": "model",
              "value_schema": {
                "key": "value"
              },
              "prompt": "prompt"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/ast")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.CreateAstAsync(
            new AstNode(new AstNode.Llm(new AstNodeLlm { Model = "model" }))
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
