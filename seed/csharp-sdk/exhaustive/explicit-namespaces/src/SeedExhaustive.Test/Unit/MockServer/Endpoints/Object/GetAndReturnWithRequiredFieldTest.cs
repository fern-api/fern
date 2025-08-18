using global::System.Threading.Tasks;
using NUnit.Framework;
using SeedExhaustive.Core;
using SeedExhaustive.Test.Unit.MockServer;
using SeedExhaustive.Types.Object;

namespace SeedExhaustive.Test.Unit.MockServer.Endpoints.Object;

[NUnit.Framework.TestFixture]
public class GetAndReturnWithRequiredFieldTest
    : SeedExhaustive.Test.Unit.MockServer.BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async global::System.Threading.Tasks.Task MockServerTest()
    {
        const string requestJson = """
            {
              "string": "string"
            }
            """;

        const string mockResponse = """
            {
              "string": "string"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/object/get-and-return-with-required-field")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Endpoints.Object.GetAndReturnWithRequiredFieldAsync(
            new SeedExhaustive.Types.Object.ObjectWithRequiredField { String = "string" }
        );
        Assert.That(
            response,
            Is.EqualTo(
                    SeedExhaustive.Core.JsonUtils.Deserialize<SeedExhaustive.Types.Object.ObjectWithRequiredField>(
                        mockResponse
                    )
                )
                .UsingDefaults()
        );
    }
}
