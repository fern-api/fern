using NUnit.Framework;
using SeedMultiUrlEnvironment;
using SeedMultiUrlEnvironment.Test.Unit.MockServer;
using SeedMultiUrlEnvironment.Test.Utils;

namespace SeedMultiUrlEnvironment.Test.Unit.MockServer.S3;

[TestFixture]
public class GetPresignedUrlTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
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
            new GetPresignedUrlRequest { S3Key = "s3Key" }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
