using NUnit.Framework;
using SeedMultiUrlEnvironment;

#nullable enable

namespace SeedMultiUrlEnvironment.Test.Unit.MockServer;

[TestFixture]
public class BootInstanceTest : BaseMockServerTest
{
    [Test]
    public void MockServerTest()
    {
        const string requestJson = """
            {
              "size": "string"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/ec2/boot")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(
            async () =>
                await Client.Ec2.BootInstanceAsync(
                    new BootInstanceRequest { Size = "string" },
                    RequestOptions
                )
        );
    }
}
