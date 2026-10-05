using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class CreateAstTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
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
