using global::System.Globalization;
using NUnit.Framework;
using SeedExhaustive.Test.Unit.MockServer;
using SeedExhaustive.Test.Utils;
using SeedExhaustive.Types;

namespace SeedExhaustive.Test.Unit.MockServer.Endpoints.Object;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GetAndReturnWithDatetimeLikeStringTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string requestJson = """
            {
              "datetimeLikeString": "2023-08-31T14:15:22Z",
              "actualDatetime": "2023-08-31T14:15:22.000Z"
            }
            """;

        const string mockResponse = """
            {
              "datetimeLikeString": "2023-08-31T14:15:22Z",
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
        JsonAssert.AreEqual(response, mockResponse);
    }
}
