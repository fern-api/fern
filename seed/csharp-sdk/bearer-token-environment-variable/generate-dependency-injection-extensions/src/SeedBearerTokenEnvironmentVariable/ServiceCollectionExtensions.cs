#if !NETFRAMEWORK

using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;

namespace SeedBearerTokenEnvironmentVariable;

public static class ServiceCollectionExtensions
{
    private static IServiceCollection AddSeedBearerTokenEnvironmentVariableClientInternal(
        this IServiceCollection services
    )
    {
        services.AddHttpClient("SeedBearerTokenEnvironmentVariableClient");

        Microsoft.Extensions.DependencyInjection.Extensions.ServiceCollectionDescriptorExtensions.TryAddScoped(
            services,
            provider =>
            {
                var options = provider
                    .GetRequiredService<Microsoft.Extensions.Options.IOptionsSnapshot<SeedBearerTokenEnvironmentVariableClientOptions>>()
                    .Value;
                var httpClientFactory =
                    provider.GetRequiredService<System.Net.Http.IHttpClientFactory>();

                var clientOptions = new ClientOptions
                {
                    HttpClient = httpClientFactory.CreateClient(
                        "SeedBearerTokenEnvironmentVariableClient"
                    ),
                    MaxRetries = options.MaxRetries,
                    Timeout = options.Timeout,
                    BaseUrl = !string.IsNullOrEmpty(options.BaseUrl) ? options.BaseUrl! : "",
                };

                return new SeedBearerTokenEnvironmentVariableClient(options.ApiKey, clientOptions);
            }
        );

        Microsoft.Extensions.DependencyInjection.Extensions.ServiceCollectionDescriptorExtensions.TryAddScoped<ISeedBearerTokenEnvironmentVariableClient>(
            services,
            provider => provider.GetRequiredService<SeedBearerTokenEnvironmentVariableClient>()
        );

        Microsoft.Extensions.DependencyInjection.Extensions.ServiceCollectionDescriptorExtensions.TryAddScoped<IServiceClient>(
            services,
            provider =>
                provider.GetRequiredService<SeedBearerTokenEnvironmentVariableClient>().Service
        );
        Microsoft.Extensions.DependencyInjection.Extensions.ServiceCollectionDescriptorExtensions.TryAddScoped<ServiceClient>(
            services,
            provider =>
                (ServiceClient)
                    provider.GetRequiredService<SeedBearerTokenEnvironmentVariableClient>().Service
        );

        return services;
    }

    /// <summary>
    /// Registers the <see cref="SeedBearerTokenEnvironmentVariableClient"/> and related services in the dependency injection container. Configuration is read from the "SeedBearerTokenEnvironmentVariableClient" section of the application's <see cref="IConfiguration"/>.
    /// </summary>
    public static IServiceCollection AddSeedBearerTokenEnvironmentVariableClient(
        this IServiceCollection services
    )
    {
        services
            .AddOptions<SeedBearerTokenEnvironmentVariableClientOptions>()
            .BindConfiguration("SeedBearerTokenEnvironmentVariableClient");

        return services.AddSeedBearerTokenEnvironmentVariableClientInternal();
    }

    /// <summary>
    /// Registers the <see cref="SeedBearerTokenEnvironmentVariableClient"/> and related services in the dependency injection container with the specified configuration.
    /// </summary>
    public static IServiceCollection AddSeedBearerTokenEnvironmentVariableClient(
        this IServiceCollection services,
        Action<SeedBearerTokenEnvironmentVariableClientOptions> configure
    )
    {
        services.AddOptions<SeedBearerTokenEnvironmentVariableClientOptions>().Configure(configure);

        return services.AddSeedBearerTokenEnvironmentVariableClientInternal();
    }

    /// <summary>
    /// Registers the <see cref="SeedBearerTokenEnvironmentVariableClient"/> and related services in the dependency injection container with configuration from the specified <see cref="IConfigurationSection"/>.
    /// </summary>
    public static IServiceCollection AddSeedBearerTokenEnvironmentVariableClient(
        this IServiceCollection services,
        IConfigurationSection configurationSection
    )
    {
        services
            .AddOptions<SeedBearerTokenEnvironmentVariableClientOptions>()
            .Bind(configurationSection);

        return services.AddSeedBearerTokenEnvironmentVariableClientInternal();
    }
}

#endif
