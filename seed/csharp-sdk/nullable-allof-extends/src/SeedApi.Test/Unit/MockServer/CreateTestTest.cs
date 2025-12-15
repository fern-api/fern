using NUnit.Framework;
using SeedApi;
using SeedApi.Core;

namespace SeedApi.Test.Unit.MockServer;

[TestFixture]
public class CreateTestTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string requestJson = """
            {
              "normalField": "normalField",
              "nullableField": "nullableField"
            }
            """;

        const string mockResponse = """
            {
              "normalField": "normalField",
              "nullableField": "nullableField"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/test")
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

        var response = await Client.CreateTestAsync(
            new RootObject { NormalField = "normalField", NullableField = "nullableField" }
        );
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<RootObject>(mockResponse)).UsingDefaults()
        );
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string requestJson = """
            {}
            """;

        const string mockResponse = """
            {
              "normalField": "normalField"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/test")
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

        var response = await Client.CreateTestAsync(new RootObject());
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<RootObject>(mockResponse)).UsingDefaults()
        );
    }
}
