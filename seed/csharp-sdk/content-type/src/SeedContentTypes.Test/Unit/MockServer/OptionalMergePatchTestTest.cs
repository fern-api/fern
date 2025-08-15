using NUnit.Framework;
using SeedContentTypes;

namespace SeedContentTypes.Test.Unit.MockServer;

[TestFixture]
public class OptionalMergePatchTestTest : BaseMockServerTest
{
    [Test]
    public void MockServerTest()
    {
        const string requestJson = """
            {
              "requiredField": "requiredField",
              "optionalString": "optionalString",
              "optionalInteger": 1,
              "optionalBoolean": true,
              "nullableString": "nullableString"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/optional-merge-patch-test")
                    .WithHeader("Content-Type", "application/merge-patch+json")
                    .UsingPatch()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () =>
            await Client.Service.OptionalMergePatchTestAsync(
                new OptionalMergePatchRequest
                {
                    RequiredField = "requiredField",
                    OptionalString = "optionalString",
                    OptionalInteger = 1,
                    OptionalBoolean = true,
                    NullableString = "nullableString",
                }
            )
        );
    }
}
