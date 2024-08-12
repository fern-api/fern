using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedIdempotencyHeaders;
using SeedIdempotencyHeaders.Test.Wire;

#nullable enable

namespace SeedIdempotencyHeaders.Test;

[TestFixture]
public class CreateTest : BaseWireTest
{
    [Test]
    public void WireTest()
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
                    .WithBody(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = Client
            .Payment.CreateAsync(new CreatePaymentRequest { Amount = 1, Currency = Currency.Usd })
            .Result;
        JToken.Parse(serializedJson).Should().BeEquivalentTo(JToken.Parse(response));
    }
}
