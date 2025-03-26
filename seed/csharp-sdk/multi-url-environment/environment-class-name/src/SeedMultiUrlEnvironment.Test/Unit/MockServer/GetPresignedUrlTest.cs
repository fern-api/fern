using global::System.Threading.Tasks;
using NUnit.Framework;
using SeedMultiUrlEnvironment;
using SeedMultiUrlEnvironment.Core;

namespace SeedMultiUrlEnvironment.Test.Unit.MockServer;

[TestFixture]
public class GetPresignedUrlTest : BaseMockServerTest
{
    [Test]
    public async global::System.Threading.Tasks.Task MockServerTest()
    {
        const string requestJson = """
            {
              "s3Key": "s3Key"
            }
            """;

        const string mockResponse = """
            "string"
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/s3/presigned-url")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.S3.GetPresignedUrlAsync(
            new GetPresignedUrlRequest { S3Key = "s3Key" },
            RequestOptions
        );
        Assert.That(response, Is.EqualTo(JsonUtils.Deserialize<string>(mockResponse)));
    }
}
