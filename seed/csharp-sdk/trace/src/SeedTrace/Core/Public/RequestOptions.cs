using SeedTrace.Core;

namespace SeedTrace;

[Serializable]
public partial class RequestOptions : IRequestOptions
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
    public IEnumerable<System.Collections.Generic.KeyValuePair<
        string,
        string?
    >> AdditionalHeaders { get;
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
    public IEnumerable<System.Collections.Generic.KeyValuePair<
        string,
        string
    >> AdditionalQueryParameters { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    } = Enumerable.Empty<System.Collections.Generic.KeyValuePair<string, string>>();

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
}
