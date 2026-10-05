using NUnit.Framework;
using SeedRequestParameters;
using SeedRequestParameters.Test.Unit.MockServer;

namespace SeedRequestParameters.Test.Unit.MockServer.User;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class CreateUsernameOptionalTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public void MockServerTest()
    {
        const string requestJson = """
            {}
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/user/username-optional")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () =>
            await Client.User.CreateUsernameOptionalAsync(
                new CreateUsernameBodyOptionalProperties()
            )
        );
    }
}
