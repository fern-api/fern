using NUnit.Framework;
using SeedUndiscriminatedUnions;
using SeedUndiscriminatedUnions.Core;

namespace SeedUndiscriminatedUnions.Test.Unit.MockServer;

[TestFixture]
public class TestCamelCasePropertiesTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string requestJson = """
            {
              "paymentMethod": {
                "method": "method",
                "cardNumber": "cardNumber"
              }
            }
            """;

        const string mockResponse = """
            "string"
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/camel-case")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Union.TestCamelCasePropertiesAsync(
            new PaymentRequest
            {
                PaymentMethod = new TokenizeCard { Method = "method", CardNumber = "cardNumber" },
            }
        );
        Assert.That(response, Is.EqualTo(JsonUtils.Deserialize<string>(mockResponse)));
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string requestJson = """
            {
              "paymentMethod": {
                "method": "card",
                "cardNumber": "1234567890123456"
              }
            }
            """;

        const string mockResponse = """
            "success"
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/camel-case")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Union.TestCamelCasePropertiesAsync(
            new PaymentRequest
            {
                PaymentMethod = new TokenizeCard
                {
                    Method = "card",
                    CardNumber = "1234567890123456",
                },
            }
        );
        Assert.That(response, Is.EqualTo(JsonUtils.Deserialize<string>(mockResponse)));
    }
}
