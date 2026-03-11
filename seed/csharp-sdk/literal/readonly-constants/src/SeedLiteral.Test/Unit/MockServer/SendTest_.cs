using NUnit.Framework;
using SeedLiteral.Test.Utils;

namespace SeedLiteral.Test.Unit.MockServer;

[TestFixture]
public class SendTest_ : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1() {

        const string mockResponse = """
        {
          "message": "message",
          "status": 1,
          "success": true
        }
        """;

        Server.Given(WireMock.RequestBuilders.Request.Create().WithPath("/path/123").UsingPost())

        .RespondWith(WireMock.ResponseBuilders.Response.Create()
        .WithStatusCode(200)
        .WithBody(mockResponse));

        var response = await Client.Path.SendAsync("123"
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2() {

        const string mockResponse = """
        {
          "message": "The weather is sunny",
          "status": 200,
          "success": true
        }
        """;

        Server.Given(WireMock.RequestBuilders.Request.Create().WithPath("/path/123").UsingPost())

        .RespondWith(WireMock.ResponseBuilders.Response.Create()
        .WithStatusCode(200)
        .WithBody(mockResponse));

        var response = await Client.Path.SendAsync("123"
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

}
e));

        var response = await Client.Reference.SendAsync(new SendRequest {Prompt = "You are a helpful assistant"
            , Query = "query", Stream = false
            , Ending = "$ending"
            , Context = "You're super wise"
            , MaybeContext = "You're super wise"
            , ContainerObject = new ContainerObject {NestedObjects = new List<NestedObjectWithLiterals>(){
                    new NestedObjectWithLiterals {Literal1 = "literal1"
                        , Literal2 = "literal2"
                        , StrProp = "strProp"}, new NestedObjectWithLiterals {Literal1 = "literal1"
                        , Literal2 = "literal2"
                        , StrProp = "strProp"}
                }
            }});
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2() {
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

        Server.Given(WireMock.RequestBuilders.Request.Create().WithPath("/reference").UsingPost().WithBodyAsJson(requestJson))

        .RespondWith(WireMock.ResponseBuilders.Response.Create()
        .WithStatusCode(200)
        .WithBody(mockResponse));

        var response = await Client.Reference.SendAsync(new SendRequest {Prompt = "You are a helpful assistant"
            , Stream = false
            , Context = "You're super wise"
            , Query = "What is the weather today", ContainerObject = new ContainerObject {NestedObjects = new List<NestedObjectWithLiterals>(){
                    new NestedObjectWithLiterals {Literal1 = "literal1"
                        , Literal2 = "literal2"
                        , StrProp = "strProp"}
                }
            }});
        JsonAssert.AreEqual(response, mockResponse);
    }

}
