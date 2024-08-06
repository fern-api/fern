using NUnit.Framework;
using SeedExhaustive.Core;
using SeedExhaustive.Test.Utils;
using SeedExhaustive.Test.Wire;
using SeedExhaustive.Types.Object;

#nullable enable

namespace SeedExhaustive.Test;

[TestFixture]
public class TestPutTest : BaseWireTest
{
    [Test]
    public void WireTest()
    {
        const string requestJson = """
            {
              "string": "string"
            }
            """;

        const string mockResponse = """
            {
              "string": "string",
              "integer": 1,
              "long": 1000000,
              "double": 1.1,
              "bool": true,
              "datetime": "2024-01-15T09:30:00Z",
              "date": "2023-01-15",
              "uuid": "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
              "base64": "SGVsbG8gd29ybGQh",
              "list": [
                "string"
              ],
              "set": [
                "string"
              ],
              "map": {
                "1": "string"
              },
              "bigint": "123456789123456789"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/http-methods/string")
                    .UsingPut()
                    .WithBody(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = Client
            .Endpoints.HttpMethods.TestPutAsync(
                "string",
                new ObjectWithRequiredField { String = "string" }
            )
            .Result;
        JsonDiffChecker.AssertJsonEquals(mockResponse, JsonUtils.Serialize(response));
    }
}
