using NUnit.Framework;
using SeedExhaustive.Test.Wire;
using SeedExhaustive.Test.Utils;
using SeedExhaustive.Core;

#nullable enable

namespace SeedExhaustive.Test;

[TestFixture]
public class GetAndReturnUuidTest : BaseWireTest
{
    [Test]
    public void WireTest() {
        const string requestJson = """
        "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"
        """;

        const string mockResponse = """
        "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"
        """;

        Server.Given(WireMock.RequestBuilders.Request.Create().WithPath("/primitive/uuid").UsingPost().WithBody(requestJson))

        .RespondWith(WireMock.ResponseBuilders.Response.Create()
        .WithStatusCode(200)
        .WithBody(mockResponse));

        var response = Client.Endpoints.Primitive.GetAndReturnUuidAsync(d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32).Result;
        JsonDiffChecker.AssertJsonEquals(mockResponse, JsonUtils.Serialize(response));
    }

}
