using System.Globalization;
using NUnit.Framework;
using SeedExhaustive.Core;
using SeedExhaustive.Test.Unit.MockServer;
using SeedExhaustive.Types.Object;

namespace SeedExhaustive.Test.Unit.MockServer.Endpoints.Object;

[TestFixture]
public class GetAndReturnWithDatetimeLikeStringTest : BaseMockServerTest
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
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Endpoints.Object.GetAndReturnWithDatetimeLikeStringAsync(
            new ObjectWithDatetimeLikeString
            {
                DatetimeLikeString = "datetimeLikeString",
                ActualDatetime = DateTime.Parse(
                    "2024-01-15T09:30:00.000Z",
                    null,
                    DateTimeStyles.AdjustToUniversal
                ),
            }
        );
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<ObjectWithDatetimeLikeString>(mockResponse))
                .UsingDefaults()
        );
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string requestJson = """
            {
              "datetimeLikeString": "2023-08-31T14:15:22.000Z",
              "actualDatetime": "2023-08-31T14:15:22.000Z"
            }
            """;

        const string mockResponse = """
            {
              "datetimeLikeString": "2023-08-31T14:15:22.000Z",
              "actualDatetime": "2023-08-31T14:15:22.000Z"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/object/get-and-return-with-datetime-like-string")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Endpoints.Object.GetAndReturnWithDatetimeLikeStringAsync(
            new ObjectWithDatetimeLikeString
            {
                DatetimeLikeString = "2023-08-31T14:15:22Z",
                ActualDatetime = DateTime.Parse(
                    "2023-08-31T14:15:22.000Z",
                    null,
                    DateTimeStyles.AdjustToUniversal
                ),
            }
        );
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<ObjectWithDatetimeLikeString>(mockResponse))
                .UsingDefaults()
        );
    }
}
