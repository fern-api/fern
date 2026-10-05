using NUnit.Framework;
using SeedExhaustive.Test.Unit.MockServer;
using SeedExhaustive.Test.Utils;
using SeedExhaustive.Types.Object;

namespace SeedExhaustive.Test.Unit.MockServer.Endpoints.Object;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GetAndReturnWithMixedRequiredAndOptionalFieldsTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string requestJson = """
            {
              "requiredString": "hello",
              "requiredInteger": 0,
              "optionalString": "world",
              "requiredLong": 0
            }
            """;

        const string mockResponse = """
            {
              "requiredString": "hello",
              "requiredInteger": 0,
              "optionalString": "world",
              "requiredLong": 0
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/object/get-and-return-with-mixed-required-and-optional-fields")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response =
            await Client.Endpoints.Object.GetAndReturnWithMixedRequiredAndOptionalFieldsAsync(
                new ObjectWithMixedRequiredAndOptionalFields
                {
                    RequiredString = "hello",
                    RequiredInteger = 0,
                    OptionalString = "world",
                    RequiredLong = 0,
                }
            );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
