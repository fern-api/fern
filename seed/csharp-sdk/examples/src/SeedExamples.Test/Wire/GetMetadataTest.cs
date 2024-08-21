using System.Threading.Tasks;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedExamples;
using SeedExamples.Core;
using SeedExamples.Test.Wire;

#nullable enable

namespace SeedExamples.Test;

[TestFixture]
public class GetMetadataTest : BaseWireTest
{
    [Test]
    public async Task WireTest_1()
    {
        const string mockResponse = """
            {
              "type": "html",
              "extra": {
                "version": "0.0.1",
                "tenancy": "test"
              },
              "tags": [
                "development",
                "public"
              ],
              "value": "<head>...</head>"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/metadata")
                    .WithParam("tag", "string")
                    .WithHeader("X-API-Version", "string")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Service.GetMetadataAsync(
            new GetMetadataRequest
            {
                Shallow = true,
                Tag = ["string"],
                XApiVersion = "string",
            },
            RequestOptions
        );
        JToken
            .Parse(mockResponse)
            .Should()
            .BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }

    [Test]
    public async Task WireTest_2()
    {
        const string mockResponse = """
            {
              "type": "html",
              "extra": {
                "version": "0.0.1",
                "tenancy": "test"
              },
              "tags": [
                "development",
                "public"
              ],
              "value": "<head>...</head>"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/metadata")
                    .WithParam("tag", "development")
                    .WithHeader("X-API-Version", "0.0.1")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Service.GetMetadataAsync(
            new GetMetadataRequest
            {
                Shallow = false,
                Tag = ["development"],
                XApiVersion = "0.0.1",
            },
            RequestOptions
        );
        JToken
            .Parse(mockResponse)
            .Should()
            .BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }
}
