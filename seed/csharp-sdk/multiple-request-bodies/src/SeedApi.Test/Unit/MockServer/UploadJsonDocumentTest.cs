using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class UploadJsonDocumentTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string requestJson = """
            {
              "author": "author",
              "tags": [
                "tags",
                "tags"
              ],
              "title": "title"
            }
            """;

        const string mockResponse = """
            {
              "author": "author",
              "id": 1,
              "tags": [
                {
                  "key": "value"
                },
                {
                  "key": "value"
                }
              ],
              "title": "title"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/documents/upload")
                    .WithHeader("Authorization", "Bearer TOKEN")
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

        var response = await Client.UploadJsonDocumentAsync(
            new UploadDocumentRequest
            {
                Author = "author",
                Tags = new List<string>() { "tags", "tags" },
                Title = "title",
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string requestJson = """
            {}
            """;

        const string mockResponse = """
            {
              "author": "author",
              "id": 1,
              "tags": [
                {
                  "key": "value"
                }
              ],
              "title": "title"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/documents/upload")
                    .WithHeader("Authorization", "Bearer TOKEN")
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

        var response = await Client.UploadJsonDocumentAsync(new UploadDocumentRequest());
        JsonAssert.AreEqual(response, mockResponse);
    }
}
