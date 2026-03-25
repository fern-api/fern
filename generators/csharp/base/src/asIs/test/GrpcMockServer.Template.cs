using Grpc.Net.Client;
using Microsoft.AspNetCore.TestHost;

namespace <%= namespace%>;

/// <summary>
/// Wraps an in-process ASP.NET Core <see cref="TestServer"/> that hosts gRPC services.
/// Dispose the instance to shut down the server and release the channel.
/// </summary>
public sealed class GrpcMockServer : IAsyncDisposable
{
    private readonly TestServer _server;

    internal GrpcMockServer(TestServer server, GrpcChannel channel)
    {
        _server = server;
        Channel = channel;
    }

    /// <summary>
    /// A <see cref="GrpcChannel"/> connected to the in-process server.
    /// Pass this to generated SDK clients.
    /// </summary>
    public GrpcChannel Channel { get; }

    /// <inheritdoc />
    public async ValueTask DisposeAsync()
    {
        Channel.Dispose();
        _server.Dispose();
    }
}
