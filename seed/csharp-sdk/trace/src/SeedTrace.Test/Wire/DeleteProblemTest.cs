using NUnit.Framework;
using SeedTrace.Test.Wire;

#nullable enable

namespace SeedTrace.Test;

[TestFixture]
public class DeleteProblemTest : BaseWireTest
{
    [Test]
    public void WireTest()
    {
        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/problem-crud/delete/string")
                    .UsingDelete()
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(
            async () => await Client.Problem.DeleteProblemAsync("string", RequestOptions)
        );
    }
}
