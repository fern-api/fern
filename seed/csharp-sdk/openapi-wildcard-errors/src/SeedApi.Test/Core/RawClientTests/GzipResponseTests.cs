using global::System.IO.Compression;
using global::System.Net.Http;
using global::System.Text;
using NUnit.Framework;
using SeedApi.Core;
using WireMock.Server;
using SystemTask = global::System.Threading.Tasks.Task;
using WireMockRequest = WireMock.RequestBuilders.Request;
using WireMockResponse = WireMock.ResponseBuilders.Response;

namespace SeedApi.Test.Core.RawClientTests;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GzipResponseTests
{
    private WireMockServer _server;
    private RawClient _rawClient;
    private string _baseUrl;

    [SetUp]
    public void SetUp()
    {
        _server = WireMockServer.Start();
        _baseUrl = _server.Url ?? "";
        _rawClient = new RawClient(new ClientOptions { MaxRetries = 0 });
    }

    [Test]
    public async SystemTask SendRequestAsync_ShouldDecompressGzipResponse()
    {
        const string body = "{\"message\": \"gzipped response\"}";
        _server
            .Given(
                WireMockRequest
                    .Create()
                    .WithPath("/gzip")
                    .WithHeader("Accept-Encoding", "gzip*")
                    .UsingGet()
            )
            .RespondWith(
                WireMockResponse
                    .Create()
                    .WithStatusCode(200)
                    .WithHeader("Content-Encoding", "gzip")
                    .WithBody(Compress(body))
            );

        var request = new SeedApi.Core.EmptyRequest
        {
            BaseUrl = _baseUrl,
            Method = HttpMethod.Get,
            Path = "/gzip",
            Headers = new Dictionary<string, string> { ["Accept-Encoding"] = "gzip" },
        };

        var response = await _rawClient.SendRequestAsync(request);
        Assert.That(response.StatusCode, Is.EqualTo(200));

        var content = await response.Raw.Content.ReadAsStringAsync();
        Assert.That(content, Is.EqualTo(body));
        Assert.That(response.Raw.Content.Headers.ContentEncoding, Is.Empty);
    }

    [Test]
    public async SystemTask SendRequestAsync_ShouldReturnUncompressedResponseUnchanged()
    {
        const string body = "{\"message\": \"plain response\"}";
        _server
            .Given(WireMockRequest.Create().WithPath("/plain").UsingGet())
            .RespondWith(WireMockResponse.Create().WithStatusCode(200).WithBody(body));

        var request = new SeedApi.Core.EmptyRequest
        {
            BaseUrl = _baseUrl,
            Method = HttpMethod.Get,
            Path = "/plain",
        };

        var response = await _rawClient.SendRequestAsync(request);
        Assert.That(response.StatusCode, Is.EqualTo(200));

        var content = await response.Raw.Content.ReadAsStringAsync();
        Assert.That(content, Is.EqualTo(body));
    }

    private static byte[] Compress(string value)
    {
        using var output = new MemoryStream();
        using (var gzipStream = new GZipStream(output, CompressionMode.Compress))
        {
            var bytes = Encoding.UTF8.GetBytes(value);
            gzipStream.Write(bytes, 0, bytes.Length);
        }
        return output.ToArray();
    }

    [TearDown]
    public void TearDown()
    {
        _server.Stop();
        _server.Dispose();
    }
}
