using NUnit.Framework;
using SeedApi;
using SeedApi.Core;

namespace SeedApi.Test.Unit.MockServer;

[TestFixture]
public class GetTestTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string mockResponse = """
            {
              "normalField": "normalField",
              "nullableField": "nullableField"
            }
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/test").UsingGet())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.GetTestAsync();
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<RootObject>(mockResponse)).UsingDefaults()
        );
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string mockResponse = """
            {
              "normalField": "normalField"
            }
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/test").UsingGet())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.GetTestAsync();
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<RootObject>(mockResponse)).UsingDefaults()
        );
    }
}
