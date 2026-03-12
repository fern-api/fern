using NUnit.Framework;
using SeedNullableOptional;
using SeedNullableOptional.Test.Unit.MockServer;
using SeedNullableOptional.Test.Utils;

namespace SeedNullableOptional.Test.Unit.MockServer.NullableOptional;

[TestFixture]
public class UpdateTagsTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string requestJson = """
            {
              "tags": [
                "tags",
                "tags"
              ],
              "categories": [
                "categories",
                "categories"
              ],
              "labels": [
                "labels",
                "labels"
              ]
            }
            """;

        const string mockResponse = """
            [
              "string",
              "string"
            ]
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/api/users/userId/tags")
                    .UsingPut()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.NullableOptional.UpdateTagsAsync(
            "userId",
            new UpdateTagsRequest
            {
                Tags = new List<string>() { "tags", "tags" },
                Categories = new List<string>() { "categories", "categories" },
                Labels = new List<string>() { "labels", "labels" },
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
