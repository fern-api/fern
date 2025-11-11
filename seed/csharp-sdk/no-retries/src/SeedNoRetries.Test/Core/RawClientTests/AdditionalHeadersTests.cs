using NUnit.Framework;
using SeedNoRetries.Core;
using WireMock.Server;
using SystemTask = global::System.Threading.Tasks.Task;
using WireMockRequest = WireMock.RequestBuilders.Request;
using WireMockResponse = WireMock.ResponseBuilders.Response;

// ReSharper disable NullableWarningSuppressionIsUsed

namespace SeedNoRetries.Test.Core.RawClientTests;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class AdditionalHeadersTests
{
    private WireMockServer _server;
    private HttpClient _httpClient;
    private RawClient _rawClient;
    private string _baseUrl;

    [SetUp]
    public void SetUp()
    {
        _server = WireMockServer.Start();
        _baseUrl = _server.Url ?? "";
        _httpClient = new HttpClient { BaseAddress = new Uri(_baseUrl) };
        _rawClient = new RawClient(
            new ClientOptions
            {
                HttpClient = _httpClient,
                Headers = new Headers(
                    new Dictionary<string, string>
                    {
                        ["a"] = "client_headers",
                        ["b"] = "client_headers",
                        ["c"] = "client_headers",
                        ["d"] = "client_headers",
                        ["e"] = "client_headers",
                        ["f"] = "client_headers",
                        ["client_multiple"] = "client_headers",
                    }
                ),
                AdditionalHeaders = new List<KeyValuePair<string, string?>>
                {
                    new("b", "client_additional_headers"),
                    new("c", "client_additional_headers"),
                    new("d", "client_additional_headers"),
                    new("e", null),
                    new("client_multiple", "client_additional_headers1"),
                    new("client_multiple", "client_additional_headers2"),
                },
            }
        );
    }

    [Test]
    public async SystemTask SendRequestAsync_AdditionalHeaderParameters()
    {
        _server
            .Given(WireMockRequest.Create().WithPath("/test").UsingGet())
            .RespondWith(WireMockResponse.Create().WithStatusCode(200).WithBody("Success"));

        var request = new JsonRequest
        {
            BaseUrl = _baseUrl,
            Method = HttpMethod.Get,
            Path = "/test",
            Headers = new Headers(
                new Dictionary<string, string>
                {
                    ["c"] = "request_headers",
                    ["d"] = "request_headers",
                    ["request_multiple"] = "request_headers",
                }
            ),
            Options = new RequestOptions
            {
                AdditionalHeaders = new List<KeyValuePair<string, string?>>
                {
                    new("d", "request_additional_headers"),
                    new("f", null),
                    new("request_multiple", "request_additional_headers1"),
                    new("request_multiple", "request_additional_headers2"),
                },
            },
        };

        var response = await _rawClient.SendRequestAsync(request);
        Assert.That(response.StatusCode, Is.EqualTo(200));

        var content = await response.Raw.Content.ReadAsStringAsync();
        Assert.Multiple(() =>
        {
            Assert.That(content, Is.EqualTo("Success"));
            Assert.That(_server.LogEntries.Count, Is.EqualTo(1));
            var headers =
                _server.LogEntries[0].RequestMessage.Headers ?? throw new global::System.Exception(
                    "Headers are null"
                );

            Assert.That(headers, Contains.Key("client_multiple"));
            Assert.That(headers!["client_multiple"][0], Does.Contain("client_additional_headers1"));
            Assert.That(headers["client_multiple"][0], Does.Contain("client_additional_headers2"));

            Assert.That(headers, Contains.Key("request_multiple"));
            Assert.That(
                headers["request_multiple"][0],
                Does.Contain("request_additional_headers1")
            );
            Assert.That(
                headers["request_multiple"][0],
                Does.Contain("request_additional_headers2")
            );

            Assert.That(headers, Contains.Key("a"));
            Assert.That(headers["a"][0], Does.Contain("client_headers"));

            Assert.That(headers, Contains.Key("b"));
            Assert.That(headers["b"][0], Does.Contain("client_additional_headers"));

            Assert.That(headers, Contains.Key("c"));
            Assert.That(headers["c"][0], Does.Contain("request_headers"));

            Assert.That(headers, Contains.Key("d"));
            Assert.That(headers["d"][0], Does.Contain("request_additional_headers"));

            Assert.That(headers, Does.Not.ContainKey("e"));
            Assert.That(headers, Does.Not.ContainKey("f"));
        });
    }

    [TearDown]
    public void TearDown()
    {
        _server.Dispose();
        _httpClient.Dispose();
    }
}
