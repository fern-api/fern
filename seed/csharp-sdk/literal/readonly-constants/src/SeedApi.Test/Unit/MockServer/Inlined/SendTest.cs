using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.Inlined;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class SendTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string requestJson = """
            {
              "prompt": "You are a helpful assistant",
              "context": "You're super wise",
              "query": "query",
              "temperature": 1.1,
              "stream": true,
              "aliasedContext": "You're super wise",
              "maybeContext": "You're super wise",
              "objectWithLiteral": {
                "nestedLiteral": {
                  "myLiteral": "How super cool"
                }
              }
            }
            """;

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
                    .WithPath("/inlined")
                    .WithHeader("Content-Type", "application/json")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Inlined.SendAsync(
            new InlinedSendRequest
            {
                Prompt = InlinedSendRequestPrompt.YouAreAHelpfulAssistant,
                Context = InlinedSendRequestContext.YoureSuperWise,
                Query = "query",
                Temperature = 1.1,
                Stream = true,
                AliasedContext = SomeAliasedLiteral.YoureSuperWise,
                MaybeContext = SomeAliasedLiteral.YoureSuperWise,
                ObjectWithLiteral = new ATopLevelLiteral
                {
                    NestedLiteral = new ANestedLiteral
                    {
                        MyLiteral = ANestedLiteralMyLiteral.HowSuperCool,
                    },
                },
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string requestJson = """
            {
              "prompt": "You are a helpful assistant",
              "query": "query",
              "stream": true,
              "aliasedContext": "You're super wise",
              "objectWithLiteral": {
                "nestedLiteral": {
                  "myLiteral": "How super cool"
                }
              }
            }
            """;

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
                    .WithPath("/inlined")
                    .WithHeader("Content-Type", "application/json")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Inlined.SendAsync(
            new InlinedSendRequest
            {
                Prompt = InlinedSendRequestPrompt.YouAreAHelpfulAssistant,
                Query = "query",
                Stream = true,
                AliasedContext = SomeAliasedLiteral.YoureSuperWise,
                ObjectWithLiteral = new ATopLevelLiteral
                {
                    NestedLiteral = new ANestedLiteral
                    {
                        MyLiteral = ANestedLiteralMyLiteral.HowSuperCool,
                    },
                },
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
