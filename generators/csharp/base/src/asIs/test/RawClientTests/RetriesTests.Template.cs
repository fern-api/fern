using global::System.Net.Http;
using global::System.Reflection;
using SystemTask = global::System.Threading.Tasks.Task;
using WireMock.Server;
using WireMockRequest = WireMock.RequestBuilders.Request;
using WireMockResponse = WireMock.ResponseBuilders.Response;
using NUnit.Framework;
using <%= namespace%>.Core;

namespace <%= testNamespace%>.Core.RawClientTests;

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
            Body = new {}
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

        var request = new StreamRequest{
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

        var request = new <%= namespaces.core %>.MultipartFormRequest{
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

        var request = new <%= context.namespaces.core %>.MultipartFormRequest{
            BaseUrl = _baseUrl,
            Method = HttpMethod.Post,
            Path = "/test",
        };
        request.AddJsonPart("object", new {});

        var response = await _rawClient.SendRequestAsync(request);
        Assert.That(response.StatusCode, Is.EqualTo(200));

        var content = await response.Raw.Content.ReadAsStringAsync();
        Assert.Multiple(() =>
        {
            Assert.That(content, Is.EqualTo("Success"));
            Assert.That(_server.LogEntries, Has.Count.EqualTo(MaxRetries));
        });
    }

    [Test]
    public async SystemTask SendRequestAsync_ShouldRespectRetryAfterHeader_WithSecondsValue()
    {
        _server
            .Given(WireMockRequest.Create().WithPath("/test").UsingGet())
            .InScenario("RetryAfter")
            .WillSetStateTo("Success")
            .RespondWith(
                WireMockResponse
                    .Create()
                    .WithStatusCode(429)
                    .WithHeader("Retry-After", "1")
            );

        _server
            .Given(WireMockRequest.Create().WithPath("/test").UsingGet())
            .InScenario("RetryAfter")
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
        Assert.Multiple(() =>
        {
            Assert.That(content, Is.EqualTo("Success"));
            Assert.That(_server.LogEntries, Has.Count.EqualTo(2));
        });
    }

    [Test]
    public async SystemTask SendRequestAsync_ShouldRespectRetryAfterHeader_WithHttpDateValue()
    {
        var retryAfterDate = DateTimeOffset.UtcNow.AddSeconds(1).ToString("R");
        _server
            .Given(WireMockRequest.Create().WithPath("/test").UsingGet())
            .InScenario("RetryAfterDate")
            .WillSetStateTo("Success")
            .RespondWith(
                WireMockResponse
                    .Create()
                    .WithStatusCode(429)
                    .WithHeader("Retry-After", retryAfterDate)
            );

        _server
            .Given(WireMockRequest.Create().WithPath("/test").UsingGet())
            .InScenario("RetryAfterDate")
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
        Assert.Multiple(() =>
        {
            Assert.That(content, Is.EqualTo("Success"));
            Assert.That(_server.LogEntries, Has.Count.EqualTo(2));
        });
    }

    [Test]
    public async SystemTask SendRequestAsync_ShouldRespectXRateLimitResetHeader()
    {
        var resetTime = DateTimeOffset.UtcNow.AddSeconds(1).ToUnixTimeSeconds().ToString();
        _server
            .Given(WireMockRequest.Create().WithPath("/test").UsingGet())
            .InScenario("RateLimitReset")
            .WillSetStateTo("Success")
            .RespondWith(
                WireMockResponse
                    .Create()
                    .WithStatusCode(429)
                    .WithHeader("X-RateLimit-Reset", resetTime)
            );

        _server
            .Given(WireMockRequest.Create().WithPath("/test").UsingGet())
            .InScenario("RateLimitReset")
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
        Assert.Multiple(() =>
        {
            Assert.That(content, Is.EqualTo("Success"));
            Assert.That(_server.LogEntries, Has.Count.EqualTo(2));
        });
    }

    [Test]
    public void GetRetryDelayFromHeaders_ShouldCapDelayAtMaxRetryDelay()
    {
        // Test that a large Retry-After value is capped at MaxRetryDelayMs (60000ms)
        // We use reflection to test the private method directly to avoid waiting for the actual delay
        var response = new HttpResponseMessage(System.Net.HttpStatusCode.TooManyRequests);
        response.Headers.Add("Retry-After", "120"); // 120 seconds = 120000ms, should be capped to 60000ms

        var method = typeof(RawClient).GetMethod(
            "GetRetryDelayFromHeaders",
            BindingFlags.Instance | BindingFlags.NonPublic
        );
        Assert.That(method, Is.Not.Null, "GetRetryDelayFromHeaders method should exist");

        var delayMs = (int)method!.Invoke(_rawClient, new object[] { response, 0 })!;

        // MaxRetryDelayMs is 60000ms (60 seconds)
        Assert.That(delayMs, Is.EqualTo(60000), "Delay should be capped at MaxRetryDelayMs (60000ms)");
    }

    [TearDown]
    public void TearDown()
    {
        _server.Dispose();
        _httpClient.Dispose();
    }
}
