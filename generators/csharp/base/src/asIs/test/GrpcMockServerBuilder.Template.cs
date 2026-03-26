using Grpc.Net.Client;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;

namespace <%= namespace%>;

/// <summary>
/// Fluent builder for creating an in-process gRPC mock server backed by
/// ASP.NET Core <see cref="TestServer"/>.
/// </summary>
public sealed class GrpcMockServerBuilder
{
    private readonly List<Action<IServiceCollection>> _serviceRegistrations = new();
    private readonly List<Action<IEndpointRouteBuilder>> _endpointRegistrations = new();

    private GrpcMockServerBuilder() { }

    /// <summary>Creates a new builder instance.</summary>
    public static GrpcMockServerBuilder Configure() => new();

    /// <summary>
    /// Registers a gRPC service implementation with the mock server.
    /// </summary>
    /// <typeparam name="TService">The gRPC service base type (e.g. <c>DataService.DataServiceBase</c>).</typeparam>
    /// <param name="implementation">An instance of the stub that will handle incoming calls.</param>
    public GrpcMockServerBuilder WithService<TService>(TService implementation)
        where TService : class
    {
        _serviceRegistrations.Add(services => services.AddSingleton(implementation));
        _endpointRegistrations.Add(endpoints => endpoints.MapGrpcService<TService>());
        return this;
    }

    /// <summary>
    /// Builds and starts the in-process gRPC server.
    /// </summary>
    public Task<GrpcMockServer> BuildAsync()
    {
        var builder = new WebHostBuilder();
        builder.ConfigureServices(services =>
        {
            services.AddGrpc();
            foreach (var registration in _serviceRegistrations)
            {
                registration(services);
            }
        });
        builder.Configure(app =>
        {
            app.UseRouting();
            app.UseEndpoints(endpoints =>
            {
                foreach (var registration in _endpointRegistrations)
                {
                    registration(endpoints);
                }
            });
        });

        var server = new TestServer(builder);
        server.PreserveExecutionContext = true;

        var httpClient = server.CreateClient();
        var channel = GrpcChannel.ForAddress(
            httpClient.BaseAddress!,
            new GrpcChannelOptions
            {
                HttpClient = httpClient,
            }
        );

        return Task.FromResult(new GrpcMockServer(server, channel, httpClient));
    }
}
