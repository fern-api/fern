using NUnit.Framework;
using SeedExamples.Core;
using SeedExamples.Test.Utils;
using SeedExamples.Test.Wire;

#nullable enable

namespace SeedExamples.Test;

[TestFixture]
public class GetExceptionTest : BaseWireTest
{
    [Test]
    public void WireTest_1()
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

        var response = Client.File.Notification.Service.GetExceptionAsync("string").Result;
        JsonDiffChecker.AssertJsonEquals(mockResponse, JsonUtils.Serialize(response));
    }

    [Test]
    public void WireTest_2()
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

        var response = Client
            .File.Notification.Service.GetExceptionAsync("notification-hsy129x")
            .Result;
        JsonDiffChecker.AssertJsonEquals(mockResponse, JsonUtils.Serialize(response));
    }
}
