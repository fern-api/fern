using NUnit.Framework;
using WireMock.Matchers;
using WireMock.Server;
using SystemTask = global::System.Threading.Tasks.Task;
using WireMockRequest = WireMock.RequestBuilders.Request;
using WireMockResponse = WireMock.ResponseBuilders.Response;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;

using <%= namespace%>.Core;

namespace <%= namespace%>.Test.Core.RawClientTests;

[Serializable]
public partial class IdempotentRequestOptions : IIdempotentRequestOptions
{
    /// <summary>
    /// The http headers sent with the request.
    /// </summary>
    Headers IRequestOptions.Headers { get; init; } = new();

    /// <summary>
    /// The Base URL for the API.
    /// </summary>
    public string? BaseUrl { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    }

    /// <summary>
    /// The http client used to make requests.
    /// </summary>
    public HttpClient? HttpClient { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    }

    /// <summary>
    /// Additional headers to be sent with the request.
    /// Headers previously set with matching keys will be overwritten.
    /// </summary>
    public IEnumerable<KeyValuePair<string, string?>> AdditionalHeaders { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    } = [];

    /// <summary>
    /// The http client used to make requests.
    /// </summary>
    public int? MaxRetries { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    }

    /// <summary>
    /// The timeout for the request.
    /// </summary>
    public TimeSpan? Timeout { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    }

    /// <summary>
    /// Additional query parameters sent with the request.
    /// </summary>
    public IEnumerable<KeyValuePair<string, string>> AdditionalQueryParameters { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    } = Enumerable.Empty<KeyValuePair<string, string>>();

    /// <summary>
    /// Additional body properties sent with the request.
    /// This is only applied to JSON requests.
    /// </summary>
    public object? AdditionalBodyProperties { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    }

    public int IdempotencyExpiration { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    }

    public string? IdempotencyKey { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    }

    Headers IIdempotentRequestOptions.GetIdempotencyHeaders()
    {
        return new Headers(
            new Dictionary<string, string> { ["IDEMPOTENCY-KEY"] = IdempotencyKey }
        );
    }
}


[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class IdempotentHeadersTests
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
    public void CheckForIdempotencyHeadersSupport()
    {
        _server
            .Given(WireMockRequest.Create().WithPath("/test").WithParam("foo", "bar").UsingGet())
            .RespondWith(WireMockResponse.Create().WithStatusCode(200).WithBody("Success"));

        var request = _rawClient.CreateHttpRequest(new JsonRequest()
        {
            BaseUrl = _baseUrl,
            Method = HttpMethod.Get,
            Path = "/test",
            Query = new Dictionary<string, object>(),
            Options = new IdempotentRequestOptions
            {
                IdempotencyKey = "1234567890"
            }
            
        });

        request.Headers.TryGetValues("IDEMPOTENCY-KEY", out var idempotencyKey);
        Assert.That(idempotencyKey?.First(), Is.EqualTo("1234567890"));
    }

    [TearDown]
    public void TearDown()
    {
        _server.Dispose();
        _httpClient.Dispose();
    }
}