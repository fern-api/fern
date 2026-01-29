using System.Text.Json;
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
        var actualJson = JsonUtils.SerializeToElement(response);
        var expectedJson = JsonUtils.Deserialize<JsonElement>(mockResponse);
        Assert.That(actualJson, Is.EqualTo(expectedJson).UsingJsonElementComparer());
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
        var actualJson = JsonUtils.SerializeToElement(response);
        var expectedJson = JsonUtils.Deserialize<JsonElement>(mockResponse);
        Assert.That(actualJson, Is.EqualTo(expectedJson).UsingJsonElementComparer());
    }
}
