using System.Diagnostics.CodeAnalysis;
using SeedBasicAuth.Core;

namespace SeedBasicAuth;

[Serializable]
public partial class ClientOptions
{
    public ClientOptions() { }

    [SetsRequiredMembers]
    internal ClientOptions(ClientOptions other)
    {
        BaseUrl = other.BaseUrl;
        HttpClient = other.HttpClient;
        MaxRetries = other.MaxRetries;
        Timeout = other.Timeout;
        Headers = new Headers(new Dictionary<string, HeaderValue>(other.Headers));
        AdditionalHeaders = other.AdditionalHeaders;
        Username = other.Username;
        Password = other.Password;
    }

    /// <summary>
    /// The http headers sent with the request.
    /// </summary>
    internal Headers Headers { get; init; } = new();

    /// <summary>
    /// The Base URL for the API.
    /// </summary>
    public required string BaseUrl { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    }

    /// <summary>
    /// The http client used to make requests.
    /// </summary>
    public HttpClient HttpClient { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    } = new HttpClient();

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
    } = TimeSpan.FromSeconds(30);

    /// <summary>
    /// The username to use for authentication.
    /// </summary>
    public string? Username { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    }

    /// <summary>
    /// The password to use for authentication.
    /// </summary>
    public string? Password { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    }

    /// <summary>
    /// Clones this and returns a new instance
    /// </summary>
    internal ClientOptions Clone()
    {
        return new ClientOptions(this);
    }
}
