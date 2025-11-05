using NUnit.Framework;
using SeedCrossPackageTypeNames;
using SeedCrossPackageTypeNames.Core;

namespace SeedCrossPackageTypeNames.Test.Unit.MockServer;

[TestFixture]
public class FindTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
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
            }
        );
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<ImportingType>(mockResponse)).UsingDefaults()
        );
    }
}
