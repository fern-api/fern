using System.Globalization;
using global::System.Threading.Tasks;
using NUnit.Framework;
using SeedExhaustive.Core;

namespace SeedExhaustive.Test.Unit.MockServer;

[TestFixture]
public class GetAndReturnDatetimeTest : BaseMockServerTest
{
    [Test]
    public async global::System.Threading.Tasks.Task MockServerTest()
    {
        const string requestJson = """
            "2024-01-15T09:30:00.000Z"
            """;

        const string mockResponse = """
            "2024-01-15T09:30:00.000Z"
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/primitive/datetime")
                    .UsingPost()
                    .WithBody(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Endpoints.Primitive.GetAndReturnDatetimeAsync(
            DateTime.Parse("2024-01-15T09:30:00.000Z", null, DateTimeStyles.AdjustToUniversal),
            RequestOptions
        );
        Assert.That(response, Is.EqualTo(JsonUtils.Deserialize<DateTime>(mockResponse)));
    }
}
