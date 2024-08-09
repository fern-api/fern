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
                    .WithBody(requestJson)
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrow(
            () =>
                Client
                    .Ec2.BootInstanceAsync(new BootInstanceRequest { Size = "string" })
                    .GetAwaiter()
                    .GetResult()
        );
    }
}
