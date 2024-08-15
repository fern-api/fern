using System.Threading.Tasks;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedExamples.Core;
using SeedExamples.Test.Wire;

#nullable enable

namespace SeedExamples.Test;

[TestFixture]
public class GetExceptionTest : BaseWireTest
{
    [Test]
    public async Task WireTest_1()
    {
        const string mockResponse = """
            {
              "type": "generic",
              "exceptionType": "Unavailable",
              "exceptionMessage": "This component is unavailable!",
              "exceptionStacktrace": "<logs>"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/file/notification/string")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.File.Notification.Service.GetExceptionAsync(
            "string",
            RequestOptions
        );
        JToken
            .Parse(mockResponse)
            .Should()
            .BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }

    [Test]
    public async Task WireTest_2()
    {
        const string mockResponse = """
            {
              "type": "generic",
              "exceptionType": "Unavailable",
              "exceptionMessage": "This component is unavailable!",
              "exceptionStacktrace": "<logs>"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/file/notification/notification-hsy129x")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.File.Notification.Service.GetExceptionAsync(
            "notification-hsy129x",
            RequestOptions
        );
        JToken
            .Parse(mockResponse)
            .Should()
            .BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }
}
