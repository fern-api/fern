using Grpc.Net.Client;
using Microsoft.AspNetCore.TestHost;

namespace SeedApi;

/// <summary>
/// Wraps an in-process ASP.NET Core <see cref="TestServer"/> that hosts gRPC services.
/// Dispose the instance to shut down the server and release the channel.
/// </summary>
public sealed class GrpcMockServer : IAsyncDisposable
{
    private readonly TestServer _server;

    internal GrpcMockServer(TestServer server, GrpcChannel channel, HttpClient httpClient)
    {
        _server = server;
        Channel = channel;
        HttpClient = httpClient;
    }

    /// <summary>
    /// A <see cref="GrpcChannel"/> connected to the in-process server.
    /// Pass this to generated SDK clients.
    /// </summary>
    public GrpcChannel Channel { get; }

    /// <summary>
    /// The <see cref="HttpClient"/> connected to the in-process server.
    /// Use this for <c>GrpcChannelOptions.HttpClient</c> when constructing SDK clients.
    /// </summary>
    public HttpClient HttpClient { get; }

    /// <inheritdoc />
    public async ValueTask DisposeAsync()
    {
        Channel.Dispose();
        HttpClient.Dispose();
        _server.Dispose();
    }
}
