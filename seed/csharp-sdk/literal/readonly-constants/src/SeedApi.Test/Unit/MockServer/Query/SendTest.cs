using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.Query;

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
            new QuerySendRequest
            {
                Prompt = QuerySendRequestPrompt.YouAreAHelpfulAssistant,
                OptionalPrompt = QuerySendRequestOptionalPrompt.YouAreAHelpfulAssistant,
                AliasPrompt = AliasToPrompt.YouAreAHelpfulAssistant,
                AliasOptionalPrompt = AliasToPrompt.YouAreAHelpfulAssistant,
                Query = "query",
                Stream = true,
                OptionalStream = true,
                AliasStream = true,
                AliasOptionalStream = true,
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
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
                    .WithParam("alias_prompt", "You are a helpful assistant")
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
            new QuerySendRequest
            {
                Prompt = QuerySendRequestPrompt.YouAreAHelpfulAssistant,
                AliasPrompt = AliasToPrompt.YouAreAHelpfulAssistant,
                Query = "query",
                Stream = true,
                AliasStream = true,
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
