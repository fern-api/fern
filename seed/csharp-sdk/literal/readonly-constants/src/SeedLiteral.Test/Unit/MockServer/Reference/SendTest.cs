using NUnit.Framework;
using SeedLiteral;
using SeedLiteral.Test.Unit.MockServer;
using SeedLiteral.Test.Utils;

namespace SeedLiteral.Test.Unit.MockServer.Reference;

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
              "stream": false,
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
                Query = "query",
                MaybeContext = "You're super wise",
                ContainerObject = new ContainerObject
                {
                    NestedObjects = new List<NestedObjectWithLiterals>()
                    {
                        new NestedObjectWithLiterals { StrProp = "strProp" },
                        new NestedObjectWithLiterals { StrProp = "strProp" },
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
              "stream": false,
              "context": "You're super wise",
              "query": "What is the weather today",
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
              "message": "The weather is sunny",
              "status": 200,
              "success": true
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/reference")
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
                Query = "What is the weather today",
                ContainerObject = new ContainerObject
                {
                    NestedObjects = new List<NestedObjectWithLiterals>()
                    {
                        new NestedObjectWithLiterals { StrProp = "strProp" },
                    },
                },
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
