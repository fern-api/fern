#if !NETFRAMEWORK

using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;

namespace SeedInferredAuthExplicit.Extensions;

public static class ServiceCollectionExtensions
{
    private static IServiceCollection AddSeedInferredAuthExplicitClientInternal(
        this IServiceCollection services
    )
    {
        services.AddHttpClient("SeedInferredAuthExplicitClient");

        Microsoft.Extensions.DependencyInjection.Extensions.ServiceCollectionDescriptorExtensions.TryAddScoped(
            services,
            provider =>
            {
                var options = provider
                    .GetRequiredService<Microsoft.Extensions.Options.IOptionsSnapshot<SeedInferredAuthExplicitClientOptions>>()
                    .Value;
                var httpClientFactory =
                    provider.GetRequiredService<System.Net.Http.IHttpClientFactory>();

                var clientOptions = new ClientOptions
                {
                    HttpClient = httpClientFactory.CreateClient("SeedInferredAuthExplicitClient"),
                    MaxRetries = options.MaxRetries,
                    Timeout = options.Timeout,
                    BaseUrl = !string.IsNullOrEmpty(options.BaseUrl) ? options.BaseUrl! : "",
                };

                return new SeedInferredAuthExplicitClient(
                    options.XApiKey!,
                    options.ClientId!,
                    options.ClientSecret!,
                    options.Scope,
                    clientOptions
                );
            }
        );

        return services;
    }

    /// <summary>
    /// Registers the <see cref="SeedInferredAuthExplicitClient"/> and related services in the dependency injection container. Configuration is read from the "SeedInferredAuthExplicitClient" section of the application's <see cref="IConfiguration"/>.
    /// </summary>
    public static IServiceCollection AddSeedInferredAuthExplicitClient(
        this IServiceCollection services
    )
    {
        services
            .AddOptions<SeedInferredAuthExplicitClientOptions>()
            .BindConfiguration("SeedInferredAuthExplicitClient");

        return services.AddSeedInferredAuthExplicitClientInternal();
    }

    /// <summary>
    /// Registers the <see cref="SeedInferredAuthExplicitClient"/> and related services in the dependency injection container with the specified configuration.
    /// </summary>
    public static IServiceCollection AddSeedInferredAuthExplicitClient(
        this IServiceCollection services,
        Action<SeedInferredAuthExplicitClientOptions> configure
    )
    {
        services.AddOptions<SeedInferredAuthExplicitClientOptions>().Configure(configure);

        return services.AddSeedInferredAuthExplicitClientInternal();
    }

    /// <summary>
    /// Registers the <see cref="SeedInferredAuthExplicitClient"/> and related services in the dependency injection container with configuration from the specified <see cref="IConfigurationSection"/>.
    /// </summary>
    public static IServiceCollection AddSeedInferredAuthExplicitClient(
        this IServiceCollection services,
        IConfigurationSection configurationSection
    )
    {
        services.AddOptions<SeedInferredAuthExplicitClientOptions>().Bind(configurationSection);

        return services.AddSeedInferredAuthExplicitClientInternal();
    }
}

#endif
