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
            grpcOptions != null
                ? GrpcChannel.ForAddress(_clientOptions.BaseUrl, grpcOptions)
                : GrpcChannel.ForAddress(_clientOptions.BaseUrl);
    }

    /// <summary>
    /// Prepares the gRPC metadata associated with the given request.
    /// The provided request headers take precedence over the headers
    /// associated with this client (which are sent on _every_ request).
    /// </summary>
    public CallOptions CreateCallOptions(
        GrpcRequestOptions options,
        CancellationToken cancellationToken = default
    )
    {
        var metadata = new global::Grpc.Core.Metadata();
        SetHeaders(metadata, _clientOptions.Headers);
        SetHeaders(metadata, options.Headers);

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

    private static void SetHeaders(global::Grpc.Core.Metadata metadata, Headers headers)
    {
        foreach (var header in headers)
        {
            var value = header.Value?.Match(str => str, func => func.Invoke());
            if (value != null)
            {
                metadata.Add(header.Key, value);
            }
        }
    }

    private GrpcChannelOptions? PrepareGrpcChannelOptions()
    {
        var grpcChannelOptions = _clientOptions.GrpcOptions;
        if (grpcChannelOptions == null)
        {
            return null;
        }
        grpcChannelOptions.HttpClient ??= _clientOptions.HttpClient;
        grpcChannelOptions.MaxRetryAttempts ??= _clientOptions.MaxRetries;
        return grpcChannelOptions;
    }
}
