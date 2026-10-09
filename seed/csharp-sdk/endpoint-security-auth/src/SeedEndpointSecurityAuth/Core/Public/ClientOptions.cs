using SeedEndpointSecurityAuth.Core;

namespace SeedEndpointSecurityAuth;

[Serializable]
public partial class ClientOptions
{
    /// <summary>
    /// The http headers sent with the request.
    /// </summary>
    internal Headers Headers { get; init; } = new();

    /// <summary>
    /// Per-scheme auth headers, keyed by auth-scheme key, populated by the root client.
    /// Used to route auth headers per endpoint based on each endpoint's declared security.
    /// </summary>
    internal Dictionary<string, Headers> AuthHeaderSchemes { get; set; } = new();

    /// <summary>
    /// The Base URL for the API.
    /// </summary>
    public string BaseUrl { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    } = "";

    /// <summary>
    /// The http client used to make requests.
    /// </summary>
    public HttpClient HttpClient { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    } = DefaultHttpClientFactory.Create();

    /// <summary>
    /// Additional headers to be sent with HTTP requests.
    /// Headers with matching keys will be overwritten by headers set on the request.
    /// </summary>
    public IEnumerable<KeyValuePair<string, string?>> AdditionalHeaders { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    } = [];

    /// <summary>
    /// The max number of retries to attempt.
    /// </summary>
    public int MaxRetries { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    } = 2;

    /// <summary>
    /// The timeout for the request.
    /// </summary>
    public TimeSpan Timeout { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    } = TimeSpan.FromMilliseconds(30000);

    /// <summary>
    /// Resolves the auth headers that apply to an endpoint with the given security requirements.
    /// </summary>
    internal Headers GetAuthHeadersForEndpoint(string[][] security)
    {
        var result = new Headers();
        if (security.Length == 0)
        {
            return result;
        }
        foreach (var requirement in security)
        {
            if (
                Array.TrueForAll(requirement, schemeKey => AuthHeaderSchemes.ContainsKey(schemeKey))
            )
            {
                foreach (var schemeKey in requirement)
                {
                    foreach (var header in AuthHeaderSchemes[schemeKey])
                    {
                        result[header.Key] = header.Value;
                    }
                }
                return result;
            }
        }
        var missing = string.Join(
            " OR ",
            Array.ConvertAll(
                security,
                requirement =>
                    string.Join(
                        " AND ",
                        Array.FindAll(
                            requirement,
                            schemeKey => !AuthHeaderSchemes.ContainsKey(schemeKey)
                        )
                    )
            )
        );
        throw new InvalidOperationException(
            "No authentication credentials provided that satisfy the endpoint's security requirements. "
                + "Please provide credentials for: "
                + missing
        );
    }

    /// <summary>
    /// Clones this and returns a new instance
    /// </summary>
    internal ClientOptions Clone()
    {
        return new ClientOptions
        {
            BaseUrl = BaseUrl,
            HttpClient = HttpClient,
            MaxRetries = MaxRetries,
            Timeout = Timeout,
            Headers = new Headers(new Dictionary<string, HeaderValue>(Headers)),
            AdditionalHeaders = AdditionalHeaders,
        };
    }
}
