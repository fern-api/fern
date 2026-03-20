using Grpc.Core;
using SeedApi.Core;

namespace SeedApi;

public partial class GrpcRequestOptions
{
    /// <summary>
    /// The maximum number of retry attempts.
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
    /// Options for write operations.
    /// </summary>
    public WriteOptions? WriteOptions { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    }

    /// <summary>
    /// Client-side call credentials. Provide authorization with per-call granularity.
    /// </summary>
    public CallCredentials? CallCredentials { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    }

    /// <summary>
    /// Additional headers to be sent with this particular request.
    /// Headers with matching keys will be overwritten by headers set on the client options.
    /// </summary>
    public IEnumerable<KeyValuePair<string, string?>> AdditionalHeaders { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    } = new List<KeyValuePair<string, string?>>();
}
