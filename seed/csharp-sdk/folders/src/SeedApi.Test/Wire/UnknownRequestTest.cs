using NUnit.Framework;
using SeedApi.Test.Wire;

#nullable enable

namespace SeedApi.Test;

[TestFixture]
public class UnknownRequestTest : BaseWireTest
{
    [Test]
    public void WireTest()
    {
        const string requestJson = """
            {
              "key": "value"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/service")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(
            async () =>
                await Client.Folder.Service.UnknownRequestAsync(
                    new Dictionary<object, object?>() { { "key", "value" }, },
                    RequestOptions
                )
        );
    }
}
