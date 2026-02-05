using global::System.Collections.Generic;
using global::System.Linq;
using global::System.Net.Http;
using NUnit.Framework;
using SeedIdempotencyHeaders.Core;
using WireMock.Matchers;
using WireMock.Server;
using SystemTask = global::System.Threading.Tasks.Task;
using WireMockRequest = WireMock.RequestBuilders.Request;
using WireMockResponse = WireMock.ResponseBuilders.Response;

// namespace SeedIdempotencyHeaders.Test.Core.RawClientTests;
namespace SeedIdempotencyHeaders.Test.Core.RawClientTests;

[Serializable]
public partial class IdempotentRequestOptions : IIdempotentRequestOptions
{
    /// <summary>
    /// The http headers sent with the request.
    /// </summary>
    internal Headers Headers { get; init; } = new();

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

    public required int IdempotencyExpiration { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    }

    public required string IdempotencyKey { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    }

    Dictionary<string, string> IIdempotentRequestOptions.GetIdempotencyHeaders()
    {
        return new Dictionary<string, string>()
        {
            ["Idempotency-Key"] = IdempotencyKey,
            ["Idempotency-Expiration"] = IdempotencyExpiration.ToString(),
        };
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
    public async SystemTask CheckForIdempotencyHeadersSupport()
    {
        // Test that GetIdempotencyHeaders() returns the correct headers
        var options = new IdempotentRequestOptions
        {
            IdempotencyKey = "1234567890",
            IdempotencyExpiration = 3600,
        };

        var headers = ((IIdempotentRequestOptions)options).GetIdempotencyHeaders();

        Assert.That(headers.Count, Is.EqualTo(2));
        Assert.That(headers.ContainsKey("Idempotency-Key"), Is.True);
        Assert.That(headers.ContainsKey("Idempotency-Expiration"), Is.True);

        Assert.That(headers["Idempotency-Key"], Is.EqualTo("1234567890"));
        Assert.That(headers["Idempotency-Expiration"], Is.EqualTo("3600"));
    }

    [TearDown]
    public void TearDown()
    {
        _server.Dispose();
        _httpClient.Dispose();
    }
}
