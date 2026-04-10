using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Unit.MockServer;

namespace SeedApi.Test.Unit.MockServer.Ec2;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class BootinstanceTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public void MockServerTest_1()
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
                    .WithHeader("Content-Type", "application/json")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () =>
            await Client.Ec2.BootinstanceAsync(new Ec2BootInstanceRequest { Size = "size" })
        );
    }

    [NUnit.Framework.Test]
    public void MockServerTest_2()
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
                    .WithHeader("Content-Type", "application/json")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () =>
            await Client.Ec2.BootinstanceAsync(new Ec2BootInstanceRequest { Size = "size" })
        );
    }
}
