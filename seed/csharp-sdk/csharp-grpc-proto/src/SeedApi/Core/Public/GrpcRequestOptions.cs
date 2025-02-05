using Grpc.Core;
using SeedApi.Core;

namespace SeedApi;

public partial class GrpcRequestOptions
{
    /// <summary>
    /// The maximum number of retry attempts.
    /// </summary>
    public int? MaxRetries { get; init; }

    /// <summary>
    /// The timeout for the request.
    /// </summary>
    public TimeSpan? Timeout { get; init; }

    /// <summary>
    /// Options for write operations.
    /// </summary>
    public WriteOptions? WriteOptions { get; init; }

    /// <summary>
    /// Client-side call credentials. Provide authorization with per-call granularity.
    /// </summary>
    public CallCredentials? CallCredentials { get; init; }

    /// <summary>
    /// Headers to be sent with this particular request.
    /// </summary>
    internal Headers Headers { get; init; } = new();
}
