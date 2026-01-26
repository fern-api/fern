using NUnit.Framework;
using SeedExhaustive.Core;
using SeedExhaustive.Types;

namespace SeedExhaustive.Test.Unit.MockServer;

[TestFixture]
public class GetWithNoRequestBodyTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string mockResponse = """
            {
              "string": "string",
              "integer": 1,
              "long": 1000000,
              "double": 1.1,
              "bool": true,
              "datetime": "2024-01-15T09:30:00.000Z",
              "date": "2023-01-15",
              "uuid": "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
              "base64": "SGVsbG8gd29ybGQh",
              "list": [
                "list",
                "list"
              ],
              "set": [
                "set"
              ],
              "map": {
                "1": "map"
              },
              "bigint": "1000000"
            }
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/no-req-body").UsingGet())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.NoReqBody.GetWithNoRequestBodyAsync();
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<ObjectWithOptionalField>(mockResponse)).UsingDefaults()
        );
    }
}
