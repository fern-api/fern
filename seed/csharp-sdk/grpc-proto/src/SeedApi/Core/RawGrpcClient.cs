using System;
using Grpc.Core;
using Grpc.Net.Client;
using User.V1;

#nullable enable

namespace SeedApi;

/// <summary>
/// Utility class for making gRPC requests to the API.
/// </summary>
internal class RawGrpcClient
{
    private ClientOptions _clientOptions;

    private Dictionary<string, string> _headers;

    private Dictionary<string, Func<string>> _headerSuppliers;

    public RawGrpcClient(
        Dictionary<string, string> headers,
        Dictionary<string, Func<string>> headerSuppliers,
        ClientOptions clientOptions
    )
    {
        _clientOptions = clientOptions;
        _headers = new Dictionary<string, string>(headers);
        _headerSuppliers = new Dictionary<string, Func<string>>(headerSuppliers);

        var grpcOptions = PrepareGrpcChannelOptions();
        var channel =
            grpcOptions != null
                ? GrpcChannel.ForAddress(_clientOptions.BaseUrl, grpcOptions)
                : GrpcChannel.ForAddress(_clientOptions.BaseUrl);
        UserServiceClient = new UserService.UserServiceClient(channel);
    }

    public UserService.UserServiceClient UserServiceClient;

    /// <summary>
    /// Prepares the gRPC metadata associated with the given request.
    /// The provided request headers take precedence over the headers
    /// associated with this client (which are sent on _every_ request).
    /// </summary>
    public CallOptions CreateCallOptions(GrpcRequestOptions options)
    {
        var metadata = new Metadata();
        foreach (var header in _headers)
        {
            metadata.Add(header.Key, header.Value);
        }
        foreach (var header in _headerSuppliers)
        {
            metadata.Add(header.Key, header.Value.Invoke());
        }
        foreach (var header in options.Headers)
        {
            metadata.Add(header.Key, header.Value);
        }
        var timeout = options.Timeout ?? _clientOptions.Timeout;
        var deadline = DateTime.UtcNow.Add(timeout);
        return new CallOptions(
            metadata,
            deadline,
            options.CancellationToken,
            options.WriteOptions,
            null,
            options.CallCredentials
        );
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
