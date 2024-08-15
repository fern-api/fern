using NUnit.Framework;
using SeedTrace.Test.Wire;

#nullable enable

namespace SeedTrace.Test;

[TestFixture]
public class UpdateTestSubmissionStatusTest : BaseWireTest
{
    [Test]
    public void WireTest()
    {
        const string requestJson = """
            {
              "type": "stopped"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath(
                        "/admin/store-test-submission-status/d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"
                    )
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(
            async () =>
                await Client.Admin.UpdateTestSubmissionStatusAsync(
                    "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                    "no-properties-union",
                    RequestOptions
                )
        );
    }
}
