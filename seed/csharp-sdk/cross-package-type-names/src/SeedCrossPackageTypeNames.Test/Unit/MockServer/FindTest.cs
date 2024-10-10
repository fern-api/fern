using System.Threading.Tasks;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedCrossPackageTypeNames;
using SeedCrossPackageTypeNames.Core;

#nullable enable

namespace SeedCrossPackageTypeNames.Test.Unit.MockServer;

[TestFixture]
public class FindTest : BaseMockServerTest
{
    [Test]
    public async Task MockServerTest()
    {
        const string requestJson = """
            {}
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
            new FindRequest { PublicProperty = null, PrivateProperty = null },
            RequestOptions
        );
        JToken
            .Parse(mockResponse)
            .Should()
            .BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }
}
