using NUnit.Framework;
using SeedTrace;
using SeedTrace.Test_.Unit.MockServer;
using SeedTrace.Test_.Utils;

namespace SeedTrace.Test_.Unit.MockServer.Migration;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GetAttemptedMigrationsTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
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
            new GetAttemptedMigrationsRequest { AdminKeyHeader = "admin-key-header" }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
