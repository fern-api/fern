using NUnit.Framework;
using OneOf;
using SeedUndiscriminatedUnions;
using SeedUndiscriminatedUnions.Core;

namespace SeedUndiscriminatedUnions.Test.Unit.MockServer;

[TestFixture]
public class GetMetadataTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string mockResponse = """
            {
              "name": "string"
            }
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/metadata").UsingGet())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Union.GetMetadataAsync();
        Assert.That(
            response,
            Is.EqualTo(
                    JsonUtils.Deserialize<Dictionary<OneOf<KeyType, string>, string>>(mockResponse)
                )
                .UsingDefaults()
        );
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string mockResponse = """
            {
              "name": "exampleName",
              "value": "exampleValue",
              "default": "exampleDefault"
            }
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/metadata").UsingGet())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Union.GetMetadataAsync();
        Assert.That(
            response,
            Is.EqualTo(
                    JsonUtils.Deserialize<Dictionary<OneOf<KeyType, string>, string>>(mockResponse)
                )
                .UsingDefaults()
        );
    }
}
