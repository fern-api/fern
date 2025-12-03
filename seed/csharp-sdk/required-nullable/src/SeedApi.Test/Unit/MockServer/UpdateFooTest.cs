using NUnit.Framework;
using SeedApi;
using SeedApi.Core;

namespace SeedApi.Test.Unit.MockServer;

[TestFixture]
public class UpdateFooTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string requestJson = """
            {
              "nullable_text": "nullable_text",
              "nullable_number": 1.1,
              "non_nullable_text": "non_nullable_text"
            }
            """;

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
                    .WithPath("/foo/id")
                    .WithHeader("X-Idempotency-Key", "X-Idempotency-Key")
                    .UsingPatch()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.UpdateFooAsync(
            "id",
            new UpdateFooRequest
            {
                XIdempotencyKey = "X-Idempotency-Key",
                NullableText = "nullable_text",
                NullableNumber = 1.1,
                NonNullableText = "non_nullable_text",
            }
        );
        Assert.That(response, Is.EqualTo(JsonUtils.Deserialize<Foo>(mockResponse)).UsingDefaults());
    }
}
