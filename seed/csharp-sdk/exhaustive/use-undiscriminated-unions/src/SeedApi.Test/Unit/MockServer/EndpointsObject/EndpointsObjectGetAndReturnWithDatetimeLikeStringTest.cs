using global::System.Globalization;
using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.EndpointsObject;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class EndpointsObjectGetAndReturnWithDatetimeLikeStringTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string requestJson = """
            {
              "datetimeLikeString": "datetimeLikeString",
              "actualDatetime": "2024-01-15T09:30:00.000Z"
            }
            """;

        const string mockResponse = """
            {
              "datetimeLikeString": "datetimeLikeString",
              "actualDatetime": "2024-01-15T09:30:00.000Z"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/object/get-and-return-with-datetime-like-string")
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

        var response =
            await Client.EndpointsObject.EndpointsObjectGetAndReturnWithDatetimeLikeStringAsync(
                new TypesObjectWithDatetimeLikeString
                {
                    DatetimeLikeString = "datetimeLikeString",
                    ActualDatetime = DateTime.Parse(
                        "2024-01-15T09:30:00.000Z",
                        null,
                        DateTimeStyles.AdjustToUniversal
                    ),
                }
            );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string requestJson = """
            {
              "datetimeLikeString": "datetimeLikeString",
              "actualDatetime": "2024-01-15T09:30:00.000Z"
            }
            """;

        const string mockResponse = """
            {
              "datetimeLikeString": "datetimeLikeString",
              "actualDatetime": "2024-01-15T09:30:00.000Z"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/object/get-and-return-with-datetime-like-string")
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

        var response =
            await Client.EndpointsObject.EndpointsObjectGetAndReturnWithDatetimeLikeStringAsync(
                new TypesObjectWithDatetimeLikeString
                {
                    DatetimeLikeString = "datetimeLikeString",
                    ActualDatetime = DateTime.Parse(
                        "2024-01-15T09:30:00.000Z",
                        null,
                        DateTimeStyles.AdjustToUniversal
                    ),
                }
            );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
