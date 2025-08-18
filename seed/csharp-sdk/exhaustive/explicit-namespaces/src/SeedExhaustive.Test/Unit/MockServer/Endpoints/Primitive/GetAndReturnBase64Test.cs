using global::System.Threading.Tasks;
using NUnit.Framework;
using SeedExhaustive.Core;
using SeedExhaustive.Test.Unit.MockServer;

namespace SeedExhaustive.Test.Unit.MockServer.Endpoints.Primitive;

[NUnit.Framework.TestFixture]
public class GetAndReturnBase64Test : SeedExhaustive.Test.Unit.MockServer.BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async global::System.Threading.Tasks.Task MockServerTest()
    {
        const string requestJson = """
            "SGVsbG8gd29ybGQh"
            """;

        const string mockResponse = """
            "SGVsbG8gd29ybGQh"
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/primitive/base64")
                    .UsingPost()
                    .WithBody(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Endpoints.Primitive.GetAndReturnBase64Async("SGVsbG8gd29ybGQh");
        Assert.That(
            response,
            Is.EqualTo(SeedExhaustive.Core.JsonUtils.Deserialize<string>(mockResponse))
        );
    }
}
