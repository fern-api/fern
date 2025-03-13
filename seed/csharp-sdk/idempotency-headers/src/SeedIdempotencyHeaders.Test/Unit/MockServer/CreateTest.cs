using global::System.Threading.Tasks;
using NUnit.Framework;
using SeedIdempotencyHeaders;
using SeedIdempotencyHeaders.Core;

namespace SeedIdempotencyHeaders.Test.Unit.MockServer;

[TestFixture]
public class CreateTest : BaseMockServerTest
{
    [Test]
    public async global::System.Threading.Tasks.Task MockServerTest()
    {
        const string requestJson = """
            {
              "amount": 1,
              "currency": "USD"
            }
            """;

        const string mockResponse = """
            "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/payment")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Payment.CreateAsync(
            new CreatePaymentRequest { Amount = 1, Currency = Currency.Usd },
            IdempotentRequestOptions
        );
        Assert.That(response, Is.EqualTo(JsonUtils.Deserialize<string>(mockResponse)));
    }
}
