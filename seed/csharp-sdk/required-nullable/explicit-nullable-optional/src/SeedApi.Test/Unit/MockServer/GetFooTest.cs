using NUnit.Framework;
using SeedApi;
using SeedApi.Core;

namespace SeedApi.Test.Unit.MockServer;

[TestFixture]
public class GetFooTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
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
                    .WithParam("optional_baz", "optional_baz")
                    .WithParam("optional_nullable_baz", "optional_nullable_baz")
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
                OptionalBaz = "optional_baz",
                OptionalNullableBaz = "optional_nullable_baz",
                RequiredBaz = "required_baz",
                RequiredNullableBaz = "required_nullable_baz",
            }
        );
        Assert.That(response, Is.EqualTo(JsonUtils.Deserialize<Foo>(mockResponse)).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
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
        Assert.That(response, Is.EqualTo(JsonUtils.Deserialize<Foo>(mockResponse)).UsingDefaults());
    }
}
