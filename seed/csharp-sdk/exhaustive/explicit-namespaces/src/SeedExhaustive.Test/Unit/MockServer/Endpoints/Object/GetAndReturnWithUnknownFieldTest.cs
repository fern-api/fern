using NUnit.Framework;
using SeedExhaustive.Test.Unit.MockServer;
using SeedExhaustive.Test.Utils;
using SeedExhaustive.Types.Object;

namespace SeedExhaustive.Test.Unit.MockServer.Endpoints.Object;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GetAndReturnWithUnknownFieldTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string requestJson = """
            {
              "unknown": {
                "$ref": "https://example.com/schema"
              }
            }
            """;

        const string mockResponse = """
            {
              "unknown": {
                "$ref": "https://example.com/schema"
              }
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/object/get-and-return-with-unknown-field")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Endpoints.Object.GetAndReturnWithUnknownFieldAsync(
            new ObjectWithUnknownField
            {
                Unknown = new Dictionary<object, object?>()
                {
                    { "$ref", "https://example.com/schema" },
                },
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
