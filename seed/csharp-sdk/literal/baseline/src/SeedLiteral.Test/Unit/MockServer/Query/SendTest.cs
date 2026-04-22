using NUnit.Framework;
using SeedLiteral;
using SeedLiteral.Test.Unit.MockServer;
using SeedLiteral.Test.Utils;

namespace SeedLiteral.Test.Unit.MockServer.Query;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class SendTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string mockResponse = """
            {
              "message": "message",
              "status": 1,
              "success": true
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/query")
                    .WithParam("prompt", "You are a helpful assistant")
                    .WithParam("optional_prompt", "You are a helpful assistant")
                    .WithParam("alias_prompt", "You are a helpful assistant")
                    .WithParam("alias_optional_prompt", "You are a helpful assistant")
                    .WithParam("query", "query")
                    .UsingPost()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Query.SendAsync(
            new SendLiteralsInQueryRequest
            {
                Prompt = "You are a helpful assistant",
                OptionalPrompt = "You are a helpful assistant",
                AliasPrompt = "You are a helpful assistant",
                AliasOptionalPrompt = "You are a helpful assistant",
                Query = "query",
                Stream = false,
                OptionalStream = false,
                AliasStream = false,
                AliasOptionalStream = false,
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string mockResponse = """
            {
              "message": "The weather is sunny",
              "status": 200,
              "success": true
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/query")
                    .WithParam("prompt", "You are a helpful assistant")
                    .WithParam("optional_prompt", "You are a helpful assistant")
                    .WithParam("alias_prompt", "You are a helpful assistant")
                    .WithParam("alias_optional_prompt", "You are a helpful assistant")
                    .WithParam("query", "What is the weather today")
                    .UsingPost()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Query.SendAsync(
            new SendLiteralsInQueryRequest
            {
                Prompt = "You are a helpful assistant",
                OptionalPrompt = "You are a helpful assistant",
                AliasPrompt = "You are a helpful assistant",
                AliasOptionalPrompt = "You are a helpful assistant",
                Stream = false,
                OptionalStream = false,
                AliasStream = false,
                AliasOptionalStream = false,
                Query = "What is the weather today",
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
