using global::System.Threading.Tasks;
using NUnit.Framework;
using SeedTrace;
using SeedTrace.Core;

namespace SeedTrace.Test.Unit.MockServer;

[TestFixture]
public class GetAttemptedMigrationsTest : BaseMockServerTest
{
    [Test]
    public async global::System.Threading.Tasks.Task MockServerTest()
    {
        const string mockResponse = """
            [
              {
                "name": "name",
                "status": "RUNNING"
              },
              {
                "name": "name",
                "status": "RUNNING"
              }
            ]
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/migration-info/all")
                    .WithHeader("admin-key-header", "admin-key-header")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Migration.GetAttemptedMigrationsAsync(
            new GetAttemptedMigrationsRequest { AdminKeyHeader = "admin-key-header" },
            RequestOptions
        );
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<IEnumerable<Migration>>(mockResponse))
                .UsingPropertiesComparer()
        );
    }
}
