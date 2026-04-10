using NUnit.Framework;
using SeedLiteral;
using SeedLiteral.Test.Unit.MockServer;
using SeedLiteral.Test.Utils;

namespace SeedLiteral.Test.Unit.MockServer.Inlined;

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
              "stream": false,
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
            new SendLiteralsInlinedRequest
            {
                Context = "You're super wise",
                Query = "query",
                Temperature = 1.1,
                MaybeContext = "You're super wise",
                ObjectWithLiteral = new ATopLevelLiteral { NestedLiteral = new ANestedLiteral() },
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string requestJson = """
            {
              "temperature": 10.1,
              "prompt": "You are a helpful assistant",
              "context": "You're super wise",
              "aliasedContext": "You're super wise",
              "maybeContext": "You're super wise",
              "objectWithLiteral": {
                "nestedLiteral": {
                  "myLiteral": "How super cool"
                }
              },
              "stream": false,
              "query": "What is the weather today"
            }
            """;

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
                    .WithPath("/inlined")
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
            new SendLiteralsInlinedRequest
            {
                Temperature = 10.1,
                Context = "You're super wise",
                MaybeContext = "You're super wise",
                ObjectWithLiteral = new ATopLevelLiteral { NestedLiteral = new ANestedLiteral() },
                Query = "What is the weather today",
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
