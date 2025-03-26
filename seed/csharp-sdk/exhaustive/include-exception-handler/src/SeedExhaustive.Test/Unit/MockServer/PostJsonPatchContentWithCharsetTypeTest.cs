using System.Globalization;
using NUnit.Framework;
using SeedExhaustive.Types;

namespace SeedExhaustive.Test.Unit.MockServer;

[TestFixture]
public class PostJsonPatchContentWithCharsetTypeTest : BaseMockServerTest
{
    [Test]
    public void MockServerTest()
    {
        const string requestJson = """
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
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/foo/baz")
                    .WithHeader("Content-Type", "application/json-patch+json; charset=utf-8")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(
            async () =>
                await Client.Endpoints.ContentType.PostJsonPatchContentWithCharsetTypeAsync(
                    new ObjectWithOptionalField
                    {
                        String = "string",
                        Integer = 1,
                        Long = 1000000,
                        Double = 1.1,
                        Bool = true,
                        Datetime = DateTime.Parse(
                            "2024-01-15T09:30:00.000Z",
                            null,
                            DateTimeStyles.AdjustToUniversal
                        ),
                        Date = new DateOnly(2023, 1, 15),
                        Uuid = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                        Base64 = "SGVsbG8gd29ybGQh",
                        List = new List<string>() { "list", "list" },
                        Set = new HashSet<string>() { "set" },
                        Map = new Dictionary<int, string>() { { 1, "map" } },
                        Bigint = "1000000",
                    },
                    RequestOptions
                )
        );
    }
}
