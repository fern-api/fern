using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Unit.MockServer;

namespace SeedApi.Test.Unit.MockServer.Service;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class OptionalmergepatchtestTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public void MockServerTest_1()
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
                    .WithHeader("Content-Type", "application/json")
                    .UsingPatch()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () =>
            await Client.Service.OptionalmergepatchtestAsync(
                new ServiceOptionalMergePatchTestRequest
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

    [NUnit.Framework.Test]
    public void MockServerTest_2()
    {
        const string requestJson = """
            {
              "requiredField": "requiredField"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/optional-merge-patch-test")
                    .WithHeader("Content-Type", "application/json")
                    .UsingPatch()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () =>
            await Client.Service.OptionalmergepatchtestAsync(
                new ServiceOptionalMergePatchTestRequest { RequiredField = "requiredField" }
            )
        );
    }
}
