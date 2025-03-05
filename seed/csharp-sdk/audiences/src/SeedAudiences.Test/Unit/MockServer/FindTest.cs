using global::System.Threading.Tasks;
using NUnit.Framework;
using SeedAudiences;
using SeedAudiences.Core;

namespace SeedAudiences.Test.Unit.MockServer;

[TestFixture]
public class FindTest : BaseMockServerTest
{
    [Test]
    public async global::System.Threading.Tasks.Task MockServerTest()
    {
        const string requestJson = """
            {
              "publicProperty": "publicProperty",
              "privateProperty": 1
            }
            """;

        const string mockResponse = """
            {
              "imported": "imported"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/")
                    .WithParam("optionalString", "optionalString")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Foo.FindAsync(
            new FindRequest
            {
                OptionalString = "optionalString",
                PublicProperty = "publicProperty",
                PrivateProperty = 1,
            },
            RequestOptions
        );
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<ImportingType>(mockResponse)).UsingPropertiesComparer()
        );
    }
}
