using NUnit.Framework;
using SeedCsharpXmlEntities.Core;
using WireMock.Matchers;
using WireMock.Server;
using SystemTask = global::System.Threading.Tasks.Task;
using WireMockRequest = WireMock.RequestBuilders.Request;
using WireMockResponse = WireMock.ResponseBuilders.Response;

namespace SeedCsharpXmlEntities.Test.Core.RawClientTests;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class AdditionalParametersTests
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
        _rawClient = new RawClient(new ClientOptions { HttpClient = _httpClient });
    }

    [Test]
    public async SystemTask SendRequestAsync_AdditionalQueryParameters()
    {
        _server
            .Given(WireMockRequest.Create().WithPath("/test").WithParam("foo", "bar").UsingGet())
            .RespondWith(WireMockResponse.Create().WithStatusCode(200).WithBody("Success"));

        var request = new JsonRequest()
        {
            BaseUrl = _baseUrl,
            Method = HttpMethod.Get,
            Path = "/test",
            Options = new RequestOptions
            {
                AdditionalQueryParameters = new List<KeyValuePair<string, string>>
                {
                    new("foo", "bar"),
                },
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
            .Given(WireMockRequest.Create().WithPath("/test").WithParam("foo", "null").UsingGet())
            .RespondWith(WireMockResponse.Create().WithStatusCode(200).WithBody("Success"));

        var request = new JsonRequest()
        {
            BaseUrl = _baseUrl,
            Method = HttpMethod.Get,
            Path = "/test",
            Query = new Dictionary<string, object> { { "foo", "bar" } },
            Options = new RequestOptions
            {
                AdditionalQueryParameters = new List<KeyValuePair<string, string>>
                {
                    new("foo", "null"),
                },
            },
        };

        var response = await _rawClient.SendRequestAsync(request);
        Assert.That(response.StatusCode, Is.EqualTo(200));

        var content = await response.Raw.Content.ReadAsStringAsync();
        Assert.That(content, Is.EqualTo("Success"));

        Assert.That(_server.LogEntries.Count, Is.EqualTo(1));
    }

    [Test]
    public async SystemTask SendRequestAsync_AdditionalQueryParameters_Merge()
    {
        _server
            .Given(WireMockRequest.Create().WithPath("/test").UsingGet())
            .RespondWith(WireMockResponse.Create().WithStatusCode(200).WithBody("Success"));

        var request = new JsonRequest()
        {
            BaseUrl = _baseUrl,
            Method = HttpMethod.Get,
            Path = "/test",
            Query = new Dictionary<string, object> { { "foo", "baz" } },
            Options = new RequestOptions
            {
                AdditionalQueryParameters = new List<KeyValuePair<string, string>>
                {
                    new("foo", "one"),
                    new("foo", "two"),
                },
            },
        };

        var response = await _rawClient.SendRequestAsync(request);
        Assert.That(response.StatusCode, Is.EqualTo(200));

        var content = await response.Raw.Content.ReadAsStringAsync();
        Assert.That(content, Is.EqualTo("Success"));

        Assert.That(_server.LogEntries.Count, Is.EqualTo(1));

        var requestUrl = _server.LogEntries.First().RequestMessage.Url;
        Assert.That(requestUrl, Does.Contain("foo=one"));
        Assert.That(requestUrl, Does.Contain("foo=two"));
        Assert.That(requestUrl, Does.Not.Contain("foo=baz"));
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

        var request = new JsonRequest
        {
            BaseUrl = _baseUrl,
            Method = HttpMethod.Post,
            Path = "/test",
            Body = new Dictionary<string, object> { { "foo", "bar" } },
            Options = new RequestOptions
            {
                AdditionalBodyProperties = new Dictionary<string, object> { { "baz", "qux" } },
            },
        };

        var response = await _rawClient.SendRequestAsync(request);
        Assert.That(response.StatusCode, Is.EqualTo(200));

        var content = await response.Raw.Content.ReadAsStringAsync();
        Assert.That(content, Is.EqualTo("Success"));

        Assert.That(_server.LogEntries.Count, Is.EqualTo(1));
    }

    [Test]
    public async SystemTask SendRequestAsync_AdditionalBodyProperties_Override()
    {
        string expectedBody = "{\n  \"foo\": null\n}";
        _server
            .Given(
                WireMockRequest
                    .Create()
                    .WithPath("/test")
                    .UsingPost()
                    .WithBody(new JsonMatcher(expectedBody))
            )
            .RespondWith(WireMockResponse.Create().WithStatusCode(200).WithBody("Success"));

        var request = new JsonRequest
        {
            BaseUrl = _baseUrl,
            Method = HttpMethod.Post,
            Path = "/test",
            Body = new Dictionary<string, object> { { "foo", "bar" } },
            Options = new RequestOptions
            {
                AdditionalBodyProperties = new Dictionary<string, object?> { { "foo", null } },
            },
        };

        var response = await _rawClient.SendRequestAsync(request);
        Assert.That(response.StatusCode, Is.EqualTo(200));

        var content = await response.Raw.Content.ReadAsStringAsync();
        Assert.That(content, Is.EqualTo("Success"));

        Assert.That(_server.LogEntries.Count, Is.EqualTo(1));
    }

    [Test]
    public async SystemTask SendRequestAsync_AdditionalBodyProperties_DeepMerge()
    {
        const string expectedBody = """
            {
                "foo": {
                    "inner1": "original",
                    "inner2": "overridden",
                    "inner3": {
                        "deepProp1": "deep-override",
                        "deepProp2": "original",
                        "deepProp3": null,
                        "deepProp4": "new-value"
                    }
                },
                "bar": "new-value",
                "baz": ["new","value"]
            }
            """;

        _server
            .Given(
                WireMockRequest
                    .Create()
                    .WithPath("/test-deep-merge")
                    .UsingPost()
                    .WithBody(new JsonMatcher(expectedBody))
            )
            .RespondWith(WireMockResponse.Create().WithStatusCode(200).WithBody("Success"));

        var request = new JsonRequest
        {
            BaseUrl = _baseUrl,
            Method = HttpMethod.Post,
            Path = "/test-deep-merge",
            Body = new Dictionary<string, object>
            {
                {
                    "foo",
                    new Dictionary<string, object>
                    {
                        { "inner1", "original" },
                        { "inner2", "original" },
                        {
                            "inner3",
                            new Dictionary<string, object>
                            {
                                { "deepProp1", "deep-original" },
                                { "deepProp2", "original" },
                                { "deepProp3", "" },
                            }
                        },
                    }
                },
                {
                    "baz",
                    new List<string> { "original" }
                },
            },
            Options = new RequestOptions
            {
                AdditionalBodyProperties = new Dictionary<string, object>
                {
                    {
                        "foo",
                        new Dictionary<string, object>
                        {
                            { "inner2", "overridden" },
                            {
                                "inner3",
                                new Dictionary<string, object?>
                                {
                                    { "deepProp1", "deep-override" },
                                    { "deepProp3", null },
                                    { "deepProp4", "new-value" },
                                }
                            },
                        }
                    },
                    { "bar", "new-value" },
                    {
                        "baz",
                        new List<string> { "new", "value" }
                    },
                },
            },
        };

        var response = await _rawClient.SendRequestAsync(request);
        Assert.That(response.StatusCode, Is.EqualTo(200));

        var content = await response.Raw.Content.ReadAsStringAsync();
        Assert.That(content, Is.EqualTo("Success"));

        Assert.That(_server.LogEntries.Count, Is.EqualTo(1));
    }

    [TearDown]
    public void TearDown()
    {
        _server.Dispose();
        _httpClient.Dispose();
    }
}
