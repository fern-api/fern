using System.Threading.Tasks;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedMultiUrlEnvironmentNoDefault;
using SeedMultiUrlEnvironmentNoDefault.Core;
using SeedMultiUrlEnvironmentNoDefault.Test.Wire;

#nullable enable

namespace SeedMultiUrlEnvironmentNoDefault.Test;

[TestFixture]
public class GetPresignedUrlTest : BaseWireTest
{
    [Test]
    public async Task WireTest()
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
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.S3.GetPresignedUrlAsync(
            new GetPresignedUrlRequest { S3Key = "string" },
            RequestOptions
        );
        JToken
            .Parse(mockResponse)
            .Should()
            .BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }
}
