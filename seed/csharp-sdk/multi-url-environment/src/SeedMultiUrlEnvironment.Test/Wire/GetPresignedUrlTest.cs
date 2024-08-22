using NUnit.Framework;
using SeedMultiUrlEnvironment;
using SeedMultiUrlEnvironment.Core;
using SeedMultiUrlEnvironment.Test.Utils;
using SeedMultiUrlEnvironment.Test.Wire;

#nullable enable

namespace SeedMultiUrlEnvironment.Test;

[TestFixture]
public class GetPresignedUrlTest : BaseWireTest
{
    [Test]
    public void WireTest()
    {
        const string requestJson = """
            {
              "s3Key": "string"
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
                    .WithBody(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = Client
            .S3.GetPresignedUrlAsync(new GetPresignedUrlRequest { S3Key = "string" })
            .Result;
        JsonDiffChecker.AssertJsonEquals(mockResponse, JsonUtils.Serialize(response));
    }
}
