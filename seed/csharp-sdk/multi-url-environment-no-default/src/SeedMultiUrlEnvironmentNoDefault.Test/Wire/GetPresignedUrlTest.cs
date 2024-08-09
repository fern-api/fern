using NUnit.Framework;
using SeedMultiUrlEnvironmentNoDefault;
using SeedMultiUrlEnvironmentNoDefault.Core;
using SeedMultiUrlEnvironmentNoDefault.Test.Utils;
using SeedMultiUrlEnvironmentNoDefault.Test.Wire;

#nullable enable

namespace SeedMultiUrlEnvironmentNoDefault.Test;

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
