using NUnit.Framework;
using SeedMultiUrlEnvironment;
using SeedMultiUrlEnvironment.Test.Unit.MockServer;

namespace SeedMultiUrlEnvironment.Test.Unit.MockServer.Ec2;

[TestFixture]
public class BootInstanceTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public void MockServerTest()
    {
        const string requestJson = """
            {
              "size": "size"
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

        Assert.DoesNotThrowAsync(async () =>
            await Client.Ec2.BootInstanceAsync(new BootInstanceRequest { Size = "size" })
        );
    }
}
