using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.Union;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class TestcamelcasepropertiesTest : BaseMockServerTest
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

        var response = await Client.Union.TestcamelcasepropertiesAsync(
            new UnionTestCamelCasePropertiesRequest
            {
                PaymentMethod = new TokenizeCard { Method = "method", CardNumber = "cardNumber" },
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
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

        var response = await Client.Union.TestcamelcasepropertiesAsync(
            new UnionTestCamelCasePropertiesRequest
            {
                PaymentMethod = new TokenizeCard { Method = "method", CardNumber = "cardNumber" },
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
