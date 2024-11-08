using System.Threading.Tasks;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedLiteral;
using SeedLiteral.Core;

#nullable enable

namespace SeedLiteral.Test.Unit.MockServer;

[TestFixture]
public class SendTest : BaseMockServerTest
{
    [Test]
    public async Task MockServerTest_1()
    {
        const string requestJson = """
            {
              "prompt": "You are a helpful assistant",
              "query": "query",
              "stream": false,
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
                Prompt = "You are a helpful assistant",
                Query = "query",
                Stream = false,
                Context = "You're super wise",
                MaybeContext = "You're super wise",
                ContainerObject = new ContainerObject
                {
                    NestedObjects = new List<NestedObjectWithLiterals>()
                    {
                        new NestedObjectWithLiterals
                        {
                            Literal1 = "literal1",
                            Literal2 = "literal2",
                            StrProp = "strProp",
                        },
                        new NestedObjectWithLiterals
                        {
                            Literal1 = "literal1",
                            Literal2 = "literal2",
                            StrProp = "strProp",
                        },
                    },
                },
            },
            RequestOptions
        );
        JToken
            .Parse(mockResponse)
            .Should()
            .BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }

    [Test]
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
                Prompt = "You are a helpful assistant",
                Stream = false,
                Context = "You're super wise",
                Query = "What is the weather today",
                ContainerObject = new ContainerObject
                {
                    NestedObjects = new List<NestedObjectWithLiterals>()
                    {
                        new NestedObjectWithLiterals
                        {
                            Literal1 = "literal1",
                            Literal2 = "literal2",
                            StrProp = "strProp",
                        },
                    },
                },
            },
            RequestOptions
        );
        JToken
            .Parse(mockResponse)
            .Should()
            .BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }
}
