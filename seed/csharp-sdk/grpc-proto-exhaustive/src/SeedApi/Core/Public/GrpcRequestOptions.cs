using System;
using System.Net.Http;
using Grpc.Core;

namespace SeedApi;

#nullable enable

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
    /// Headers to be sent with this particular request.
    /// </summary>
    public Dictionary<string, string> Headers { get; init; } = new Dictionary<string, string>();

    /// <summary>
    /// The cancellation token used with this particular request.
    /// </summary>
    public CancellationToken CancellationToken { get; init; } = default(CancellationToken);

    /// <summary>
    /// Options for write operations.
    /// </summary>
    public WriteOptions? WriteOptions { get; init; }

    /// <summary>
    /// Client-side call credentials. Provide authorization with per-call granularity.
    /// </summary>
    public CallCredentials? CallCredentials { get; init; }
}
