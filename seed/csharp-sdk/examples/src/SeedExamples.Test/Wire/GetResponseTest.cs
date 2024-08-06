using NUnit.Framework;
using SeedExamples.Core;
using SeedExamples.Test.Utils;
using SeedExamples.Test.Wire;

#nullable enable

namespace SeedExamples.Test;

[TestFixture]
public class GetResponseTest : BaseWireTest
{
    [Test]
    public void WireTest_1()
    {
        const string mockResponse = """
            {
              "response": "Initializing...",
              "identifiers": [
                {
                  "type": "primitive",
                  "value": "example",
                  "label": "Primitive"
                },
                {
                  "type": "unknown",
                  "value": "{}",
                  "label": "Unknown"
                }
              ]
            }
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/response").UsingPost())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = Client.Service.GetResponseAsync().Result;
        JsonDiffChecker.AssertJsonEquals(mockResponse, JsonUtils.Serialize(response));
    }

    [Test]
    public void WireTest_2()
    {
        const string mockResponse = """
            {
              "response": "Initializing...",
              "identifiers": [
                {
                  "type": "primitive",
                  "value": "example",
                  "label": "Primitive"
                },
                {
                  "type": "unknown",
                  "value": "{}",
                  "label": "Unknown"
                }
              ]
            }
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("//response").UsingPost())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = Client.Service.GetResponseAsync().Result;
        JsonDiffChecker.AssertJsonEquals(mockResponse, JsonUtils.Serialize(response));
    }
}
