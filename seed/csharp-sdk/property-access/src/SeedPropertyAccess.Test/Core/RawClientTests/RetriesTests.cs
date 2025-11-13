using global::System.Net.Http;
using NUnit.Framework;
using SeedPropertyAccess.Core;
using WireMock.Server;
using SystemTask = global::System.Threading.Tasks.Task;
using WireMockRequest = WireMock.RequestBuilders.Request;
using WireMockResponse = WireMock.ResponseBuilders.Response;

namespace SeedPropertyAccess.Test.Core.RawClientTests;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class RetriesTests
{
    private const int MaxRetries = 3;
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
            new ClientOptions { HttpClient = _httpClient, MaxRetries = MaxRetries }
        )
        {
            BaseRetryDelay = 0,
        };
    }

    [Test]
    [TestCase(408)]
    [TestCase(429)]
    [TestCase(500)]
    [TestCase(504)]
    public async SystemTask SendRequestAsync_ShouldRetry_OnRetryableStatusCodes(int statusCode)
    {
        _server
            .Given(WireMockRequest.Create().WithPath("/test").UsingGet())
            .InScenario("Retry")
            .WillSetStateTo("Server Error")
            .RespondWith(WireMockResponse.Create().WithStatusCode(statusCode));

        _server
            .Given(WireMockRequest.Create().WithPath("/test").UsingGet())
            .InScenario("Retry")
            .WhenStateIs("Server Error")
            .WillSetStateTo("Success")
            .RespondWith(WireMockResponse.Create().WithStatusCode(statusCode));

        _server
            .Given(WireMockRequest.Create().WithPath("/test").UsingGet())
            .InScenario("Retry")
            .WhenStateIs("Success")
            .RespondWith(WireMockResponse.Create().WithStatusCode(200).WithBody("Success"));

        var request = new EmptyRequest
        {
            BaseUrl = _baseUrl,
            Method = HttpMethod.Get,
            Path = "/test",
        };

        var response = await _rawClient.SendRequestAsync(request);
        Assert.That(response.StatusCode, Is.EqualTo(200));

        var content = await response.Raw.Content.ReadAsStringAsync();
        using (Assert.EnterMultipleScope())
        {
            Assert.That(content, Is.EqualTo("Success"));

            Assert.That(_server.LogEntries, Has.Count.EqualTo(MaxRetries));
        }
    }

    [Test]
    [TestCase(400)]
    [TestCase(409)]
    public async SystemTask SendRequestAsync_ShouldRetry_OnNonRetryableStatusCodes(int statusCode)
    {
        _server
            .Given(WireMockRequest.Create().WithPath("/test").UsingGet())
            .InScenario("Retry")
            .WillSetStateTo("Server Error")
            .RespondWith(WireMockResponse.Create().WithStatusCode(statusCode).WithBody("Failure"));

        var request = new JsonRequest
        {
            BaseUrl = _baseUrl,
            Method = HttpMethod.Get,
            Path = "/test",
            Body = new { },
        };

        var response = await _rawClient.SendRequestAsync(request);
        Assert.That(response.StatusCode, Is.EqualTo(statusCode));

        var content = await response.Raw.Content.ReadAsStringAsync();
        Assert.Multiple(() =>
        {
            Assert.That(content, Is.EqualTo("Failure"));

            Assert.That(_server.LogEntries, Has.Count.EqualTo(1));
        });
    }

    [Test]
    public async SystemTask SendRequestAsync_ShouldNotRetry_WithStreamRequest()
    {
        _server
            .Given(WireMockRequest.Create().WithPath("/test").UsingPost())
            .InScenario("Retry")
            .WillSetStateTo("Server Error")
            .RespondWith(WireMockResponse.Create().WithStatusCode(429).WithBody("Failure"));

        var request = new StreamRequest
        {
            BaseUrl = _baseUrl,
            Method = HttpMethod.Post,
            Path = "/test",
            Body = new MemoryStream(),
        };

        var response = await _rawClient.SendRequestAsync(request);
        Assert.That(response.StatusCode, Is.EqualTo(429));

        var content = await response.Raw.Content.ReadAsStringAsync();
        Assert.Multiple(() =>
        {
            Assert.That(content, Is.EqualTo("Failure"));
            Assert.That(_server.LogEntries, Has.Count.EqualTo(1));
        });
    }

    [Test]
    public async SystemTask SendRequestAsync_ShouldNotRetry_WithMultiPartFormRequest_WithStream()
    {
        _server
            .Given(WireMockRequest.Create().WithPath("/test").UsingPost())
            .InScenario("Retry")
            .WillSetStateTo("Server Error")
            .RespondWith(WireMockResponse.Create().WithStatusCode(429).WithBody("Failure"));

        var request = new SeedPropertyAccess.Core.MultipartFormRequest
        {
            BaseUrl = _baseUrl,
            Method = HttpMethod.Post,
            Path = "/test",
        };
        request.AddFileParameterPart("file", new MemoryStream());

        var response = await _rawClient.SendRequestAsync(request);
        Assert.That(response.StatusCode, Is.EqualTo(429));

        var content = await response.Raw.Content.ReadAsStringAsync();
        Assert.Multiple(() =>
        {
            Assert.That(content, Is.EqualTo("Failure"));
            Assert.That(_server.LogEntries, Has.Count.EqualTo(1));
        });
    }

    [Test]
    public async SystemTask SendRequestAsync_ShouldRetry_WithMultiPartFormRequest_WithoutStream()
    {
        _server
            .Given(WireMockRequest.Create().WithPath("/test").UsingPost())
            .InScenario("Retry")
            .WillSetStateTo("Server Error")
            .RespondWith(WireMockResponse.Create().WithStatusCode(429));

        _server
            .Given(WireMockRequest.Create().WithPath("/test").UsingPost())
            .InScenario("Retry")
            .WhenStateIs("Server Error")
            .WillSetStateTo("Success")
            .RespondWith(WireMockResponse.Create().WithStatusCode(429));

        _server
            .Given(WireMockRequest.Create().WithPath("/test").UsingPost())
            .InScenario("Retry")
            .WhenStateIs("Success")
            .RespondWith(WireMockResponse.Create().WithStatusCode(200).WithBody("Success"));

        var request = new SeedPropertyAccess.Core.MultipartFormRequest
        {
            BaseUrl = _baseUrl,
            Method = HttpMethod.Post,
            Path = "/test",
        };
        request.AddJsonPart("object", new { });

        var response = await _rawClient.SendRequestAsync(request);
        Assert.That(response.StatusCode, Is.EqualTo(200));

        var content = await response.Raw.Content.ReadAsStringAsync();
        Assert.Multiple(() =>
        {
            Assert.That(content, Is.EqualTo("Success"));
            Assert.That(_server.LogEntries, Has.Count.EqualTo(MaxRetries));
        });
    }

    [TearDown]
    public void TearDown()
    {
        _server.Dispose();
        _httpClient.Dispose();
    }
}
