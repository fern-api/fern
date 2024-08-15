using System.Threading.Tasks;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedExamples.Core;
using SeedExamples.File;
using SeedExamples.Test.Wire;

#nullable enable

namespace SeedExamples.Test;

[TestFixture]
public class GetFileTest : BaseWireTest
{
    [Test]
    public async Task WireTest()
    {
        const string mockResponse = """
            {
              "name": "file.txt",
              "contents": "..."
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/file/string")
                    .WithHeader("X-File-API-Version", "string")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.File.Service.GetFileAsync(
            "string",
            new GetFileRequest(),
            RequestOptions
        );
        JToken
            .Parse(mockResponse)
            .Should()
            .BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }
}
