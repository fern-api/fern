using NUnit.Framework;
using SeedExhaustive.Test.Unit.MockServer;
using SeedExhaustive.Test.Utils;
using SeedExhaustive.Types;

namespace SeedExhaustive.Test.Unit.MockServer.Endpoints.Object;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GetAndReturnWithRequiredNestedObjectTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string requestJson = """
            {
              "requiredString": "hello",
              "requiredObject": {
                "string": "nested",
                "NestedObject": {}
              }
            }
            """;

        const string mockResponse = """
            {
              "requiredString": "hello",
              "requiredObject": {
                "string": "nested",
                "NestedObject": {}
              }
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/object/get-and-return-with-required-nested-object")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Endpoints.Object.GetAndReturnWithRequiredNestedObjectAsync(
            new ObjectWithRequiredNestedObject
            {
                RequiredString = "hello",
                RequiredObject = new NestedObjectWithRequiredField
                {
                    String = "nested",
                    NestedObject = new ObjectWithOptionalField(),
                },
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
