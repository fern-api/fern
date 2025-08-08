using NUnit.Framework;

namespace SeedContentTypes.Test.Unit.MockServer;

[TestFixture]
public class RegularPatchTest : BaseMockServerTest
{
    [Test]
    public void MockServerTest()
    {
        const string requestJson = """
            {
              "field1": "field1",
              "field2": 1
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/regular/id")
                    .UsingPatch()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () =>
            await Client.Service.RegularPatchAsync(
                "id",
                new RegularPatchRequest { Field1 = "field1", Field2 = 1 }
            )
        );
    }
}
