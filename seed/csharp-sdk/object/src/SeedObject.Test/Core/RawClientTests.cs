using NUnit.Framework;
using SeedObject;
using SeedObject.Core;
using WireMock.Matchers;
using WireMock.Server;
using SystemTask = System.Threading.Tasks.Task;
using WireMockRequest = WireMock.RequestBuilders.Request;
using WireMockResponse = WireMock.ResponseBuilders.Response;

namespace SeedObject.Test.Core;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class RawClientTests
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

        var request = new RawClient.BaseApiRequest
        {
            BaseUrl = _baseUrl,
            Method = HttpMethod.Get,
            Path = "/test",
        };

        var response = await _rawClient.SendRequestAsync(request);
        Assert.That(response.StatusCode, Is.EqualTo(200));

        var content = await response.Raw.Content.ReadAsStringAsync();
        Assert.That(content, Is.EqualTo("Success"));

        Assert.That(_server.LogEntries.Count, Is.EqualTo(MaxRetries));
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

        var request = new RawClient.BaseApiRequest
        {
            BaseUrl = _baseUrl,
            Method = HttpMethod.Get,
            Path = "/test",
        };

        var response = await _rawClient.SendRequestAsync(request);
        Assert.That(response.StatusCode, Is.EqualTo(statusCode));

        var content = await response.Raw.Content.ReadAsStringAsync();
        Assert.That(content, Is.EqualTo("Failure"));

        Assert.That(_server.LogEntries.Count, Is.EqualTo(1));
    }

    [Test]
    public async SystemTask SendRequestAsync_AdditionalQueryParameters()
    {
        _server
            .Given(WireMockRequest.Create().WithPath("/test").WithParam("foo", "bar").UsingGet())
            .RespondWith(WireMockResponse.Create().WithStatusCode(200).WithBody("Success"));

        var request = new RawClient.BaseApiRequest
        {
            BaseUrl = _baseUrl,
            Method = HttpMethod.Get,
            Path = "/test",
            Options = new RequestOptions
            {
                QueryParameters = new Dictionary<string, object> { { "foo", "bar" } },
            },
        };

        var response = await _rawClient.SendRequestAsync(request);
        Assert.That(response.StatusCode, Is.EqualTo(200));

        var content = await response.Raw.Content.ReadAsStringAsync();
        Assert.That(content, Is.EqualTo("Success"));

        Assert.That(_server.LogEntries.Count, Is.EqualTo(1));
    }

    [Test]
    public async SystemTask SendRequestAsync_AdditionalQueryParameters_Override()
    {
        _server
            .Given(WireMockRequest.Create().WithPath("/test").WithParam("foo", "baz").UsingGet())
            .RespondWith(WireMockResponse.Create().WithStatusCode(200).WithBody("Success"));

        var request = new RawClient.BaseApiRequest
        {
            BaseUrl = _baseUrl,
            Method = HttpMethod.Get,
            Path = "/test",
            Query = new Dictionary<string, object> { { "foo", "bar" } },
            Options = new RequestOptions
            {
                QueryParameters = new Dictionary<string, object> { { "foo", "baz" } },
            },
        };

        var response = await _rawClient.SendRequestAsync(request);
        Assert.That(response.StatusCode, Is.EqualTo(200));

        var content = await response.Raw.Content.ReadAsStringAsync();
        Assert.That(content, Is.EqualTo("Success"));

        Assert.That(_server.LogEntries.Count, Is.EqualTo(1));
    }

    [Test]
    public async SystemTask SendRequestAsync_AdditionalBodyProperties()
    {
        string expectedBody = "{\n  \"foo\": \"bar\",\n  \"baz\": \"qux\"\n}";
        _server
            .Given(
                WireMockRequest
                    .Create()
                    .WithPath("/test")
                    .UsingPost()
                    .WithBody(new JsonMatcher(expectedBody))
            )
            .RespondWith(WireMockResponse.Create().WithStatusCode(200).WithBody("Success"));

        var request = new RawClient.JsonApiRequest
        {
            BaseUrl = _baseUrl,
            Method = HttpMethod.Post,
            Path = "/test",
            Body = new Dictionary<string, object> { { "foo", "bar" } },
            Options = new RequestOptions
            {
                BodyProperties = new Dictionary<string, object> { { "baz", "qux" } },
            },
        };

        var response = await _rawClient.SendRequestAsync(request);
        Assert.That(response.StatusCode, Is.EqualTo(200));

        var content = await response.Raw.Content.ReadAsStringAsync();
        Assert.That(content, Is.EqualTo("Success"));

        Assert.That(_server.LogEntries.Count, Is.EqualTo(1));

        var requestBody = _server.LogEntries.First().RequestMessage.Body;
        Assert.That(requestBody, Is.EqualTo(expectedBody));
    }

    [Test]
    public async SystemTask SendRequestAsync_AdditionalBodyProperties_Override()
    {
        string expectedBody = "{\n  \"foo\": \"baz\"\n}";
        _server
            .Given(
                WireMockRequest
                    .Create()
                    .WithPath("/test")
                    .UsingPost()
                    .WithBody(new JsonMatcher(expectedBody))
            )
            .RespondWith(WireMockResponse.Create().WithStatusCode(200).WithBody("Success"));

        var request = new RawClient.JsonApiRequest
        {
            BaseUrl = _baseUrl,
            Method = HttpMethod.Post,
            Path = "/test",
            Body = new Dictionary<string, object> { { "foo", "bar" } },
            Options = new RequestOptions
            {
                BodyProperties = new Dictionary<string, object> { { "foo", "baz" } },
            },
        };

        var response = await _rawClient.SendRequestAsync(request);
        Assert.That(response.StatusCode, Is.EqualTo(200));

        var content = await response.Raw.Content.ReadAsStringAsync();
        Assert.That(content, Is.EqualTo("Success"));

        Assert.That(_server.LogEntries.Count, Is.EqualTo(1));

        var requestBody = _server.LogEntries.First().RequestMessage.Body;
        Assert.That(requestBody, Is.EqualTo(expectedBody));
    }

    [TearDown]
    public void TearDown()
    {
        _server.Dispose();
        _httpClient.Dispose();
    }
}
