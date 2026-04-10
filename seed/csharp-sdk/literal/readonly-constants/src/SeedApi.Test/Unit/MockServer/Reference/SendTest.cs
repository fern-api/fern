using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.Reference;

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
              "query": "query",
              "stream": true,
              "ending": "$ending",
              "context": "You're super wise",
              "maybeContext": "You're super wise",
              "containerObject": {
                "nestedObjects": [
                  {
                    "literal1": "literal1",
                    "literal2": "literal2",
                    "strProp": "strProp"
                  },
                  {
                    "literal1": "literal1",
                    "literal2": "literal2",
                    "strProp": "strProp"
                  }
                ]
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
                    .WithPath("/reference")
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

        var response = await Client.Reference.SendAsync(
            new SendRequest
            {
                Prompt = SendRequestPrompt.YouAreAHelpfulAssistant,
                Query = "query",
                Stream = true,
                Ending = SendRequestEnding.Ending,
                Context = SomeLiteral.YoureSuperWise,
                MaybeContext = SomeLiteral.YoureSuperWise,
                ContainerObject = new ContainerObject
                {
                    NestedObjects = new List<NestedObjectWithLiterals>()
                    {
                        new NestedObjectWithLiterals
                        {
                            Literal1 = NestedObjectWithLiteralsLiteral1.Literal1,
                            Literal2 = NestedObjectWithLiteralsLiteral2.Literal2,
                            StrProp = "strProp",
                        },
                        new NestedObjectWithLiterals
                        {
                            Literal1 = NestedObjectWithLiteralsLiteral1.Literal1,
                            Literal2 = NestedObjectWithLiteralsLiteral2.Literal2,
                            StrProp = "strProp",
                        },
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
              "ending": "\\$ending",
              "context": "You're super wise",
              "containerObject": {
                "nestedObjects": [
                  {
                    "literal1": "literal1",
                    "literal2": "literal2",
                    "strProp": "strProp"
                  }
                ]
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
                    .WithPath("/reference")
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

        var response = await Client.Reference.SendAsync(
            new SendRequest
            {
                Prompt = SendRequestPrompt.YouAreAHelpfulAssistant,
                Query = "query",
                Stream = true,
                Ending = SendRequestEnding.Ending,
                Context = SomeLiteral.YoureSuperWise,
                ContainerObject = new ContainerObject
                {
                    NestedObjects = new List<NestedObjectWithLiterals>()
                    {
                        new NestedObjectWithLiterals
                        {
                            Literal1 = NestedObjectWithLiteralsLiteral1.Literal1,
                            Literal2 = NestedObjectWithLiteralsLiteral2.Literal2,
                            StrProp = "strProp",
                        },
                    },
                },
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
