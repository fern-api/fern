using NUnit.Framework;
using OneOf;
using SeedApi;
using SeedApi.Core;

namespace SeedApi.Test.Unit.MockServer;

[TestFixture]
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
        Assert.That(
            response.Value,
            Is.EqualTo(
                    JsonUtils
                        .Deserialize<OneOf<DocumentMetadata, DocumentUploadResult>>(mockResponse)
                        .Value
                )
                .UsingDefaults()
        );
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
        Assert.That(
            response.Value,
            Is.EqualTo(
                    JsonUtils
                        .Deserialize<OneOf<DocumentMetadata, DocumentUploadResult>>(mockResponse)
                        .Value
                )
                .UsingDefaults()
        );
    }
}
