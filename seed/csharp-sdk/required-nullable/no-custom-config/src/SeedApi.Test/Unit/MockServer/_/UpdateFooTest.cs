using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer._;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class UpdateFooTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
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
                    .WithHeader("X-Idempotency-Key", "idempotencyKey")
                    .WithHeader("Content-Type", "application/json")
                    .UsingPatch()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client._.UpdateFooAsync(
            new UpdateFooRequest
            {
                Id = "id",
                IdempotencyKey = "idempotencyKey",
                NullableText = "nullable_text",
                NullableNumber = 1.1,
                NonNullableText = "non_nullable_text",
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string requestJson = """
            {}
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
                    .WithHeader("Content-Type", "application/json")
                    .UsingPatch()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client._.UpdateFooAsync(
            new UpdateFooRequest { Id = "id", IdempotencyKey = "X-Idempotency-Key" }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
