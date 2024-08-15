using NUnit.Framework;
using SeedMultiUrlEnvironmentNoDefault;
using SeedMultiUrlEnvironmentNoDefault.Test.Wire;

#nullable enable

namespace SeedMultiUrlEnvironmentNoDefault.Test;

[TestFixture]
public class BootInstanceTest : BaseWireTest
{
    [Test]
    public void WireTest()
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
