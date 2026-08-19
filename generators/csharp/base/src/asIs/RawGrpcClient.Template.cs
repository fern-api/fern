using Grpc.Core;
using Grpc.Net.Client;

namespace <%= namespace%>;

/// <summary>
/// Utility class for making gRPC requests to the API.
/// </summary>
internal class RawGrpcClient
{
    /// <summary>
    /// The gRPC channel used to make requests.
    /// </summary>
    public readonly GrpcChannel Channel;

    private readonly ClientOptions _clientOptions;

    public RawGrpcClient(ClientOptions clientOptions)
    {
        _clientOptions = clientOptions;

        var grpcOptions = PrepareGrpcChannelOptions();
        Channel =
            grpcOptions is not null
                ? GrpcChannel.ForAddress(_clientOptions.BaseUrl, grpcOptions)
                : GrpcChannel.ForAddress(_clientOptions.BaseUrl);
    }

    /// <summary>
    /// Creates CallOptions for a gRPC request with the provided metadata, timeout, and credentials.
    /// Metadata (headers) should be built at the endpoint level before calling this method.
    /// </summary>
    public CallOptions CreateCallOptions(
        global::Grpc.Core.Metadata metadata,
        GrpcRequestOptions options,
        CancellationToken cancellationToken = default
    )
    {
        var timeout = options.Timeout ?? _clientOptions.Timeout;
        var deadline = DateTime.UtcNow.Add(timeout);
        return new CallOptions(
            metadata,
            deadline,
            cancellationToken,
            options.WriteOptions,
            null,
            options.CallCredentials
        );
    }

    private GrpcChannelOptions? PrepareGrpcChannelOptions()
    {
        var grpcChannelOptions = _clientOptions.GrpcOptions;
        if (grpcChannelOptions is null)
        {
            return null;
        }
        grpcChannelOptions.HttpClient ??= _clientOptions.HttpClient;
        grpcChannelOptions.MaxRetryAttempts ??= _clientOptions.MaxRetries;
        return grpcChannelOptions;
    }
}
