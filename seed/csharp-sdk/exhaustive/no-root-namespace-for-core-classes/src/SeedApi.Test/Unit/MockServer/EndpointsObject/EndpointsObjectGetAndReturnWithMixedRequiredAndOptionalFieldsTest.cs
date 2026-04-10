using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.EndpointsObject;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class EndpointsObjectGetAndReturnWithMixedRequiredAndOptionalFieldsTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string requestJson = """
            {
              "requiredString": "requiredString",
              "requiredInteger": 1,
              "optionalString": "optionalString",
              "requiredLong": 1000000
            }
            """;

        const string mockResponse = """
            {
              "requiredString": "requiredString",
              "requiredInteger": 1,
              "optionalString": "optionalString",
              "requiredLong": 1000000
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/object/get-and-return-with-mixed-required-and-optional-fields")
                    .WithHeader("Content-Type", "application/json")
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
            await Client.EndpointsObject.EndpointsObjectGetAndReturnWithMixedRequiredAndOptionalFieldsAsync(
                new TypesObjectWithMixedRequiredAndOptionalFields
                {
                    RequiredString = "requiredString",
                    RequiredInteger = 1,
                    OptionalString = "optionalString",
                    RequiredLong = 1000000,
                }
            );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string requestJson = """
            {
              "requiredString": "requiredString",
              "requiredInteger": 1,
              "requiredLong": 1000000
            }
            """;

        const string mockResponse = """
            {
              "requiredString": "requiredString",
              "requiredInteger": 1,
              "optionalString": "optionalString",
              "requiredLong": 1000000
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/object/get-and-return-with-mixed-required-and-optional-fields")
                    .WithHeader("Content-Type", "application/json")
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
            await Client.EndpointsObject.EndpointsObjectGetAndReturnWithMixedRequiredAndOptionalFieldsAsync(
                new TypesObjectWithMixedRequiredAndOptionalFields
                {
                    RequiredString = "requiredString",
                    RequiredInteger = 1,
                    RequiredLong = 1000000,
                }
            );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
