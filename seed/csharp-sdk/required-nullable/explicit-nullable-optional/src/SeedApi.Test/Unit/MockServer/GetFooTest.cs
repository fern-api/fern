using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GetFooTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string mockResponse = """
            {
              "bar": "bar",
              "nullable_bar": "nullable_bar",
              "nullable_required_bar": "nullable_required_bar",
              "required_bar": "required_bar"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/foo")
                    .WithParam("required_baz", "required_baz")
                    .WithParam("required_nullable_baz", "required_nullable_baz")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.GetFooAsync(
            new GetFooRequest
            {
                RequiredBaz = "required_baz",
                RequiredNullableBaz = "required_nullable_baz",
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
