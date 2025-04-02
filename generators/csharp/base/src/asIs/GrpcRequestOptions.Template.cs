using Grpc.Core;
using <%= namespace%>.Core;

namespace <%= namespace%>;

public partial class GrpcRequestOptions
{
    /// <summary>
    /// The maximum number of retry attempts.
    /// </summary>
    public int? MaxRetries {
        get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    }

    /// <summary>
    /// The timeout for the request.
    /// </summary>
    public TimeSpan? Timeout {
        get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    }

    /// <summary>
    /// Options for write operations.
    /// </summary>
    public WriteOptions? WriteOptions {
        get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    }

    /// <summary>
    /// Client-side call credentials. Provide authorization with per-call granularity.
    /// </summary>
    public CallCredentials? CallCredentials {
        get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    }

    /// <summary>
    /// Headers to be sent with this particular request.
    /// </summary>
    internal Headers Headers {
        get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    } = new();
}
