#if !NETFRAMEWORK

using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;

namespace SeedInferredAuthExplicit;

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

                var xApiKey =
                    options.XApiKey
                    ?? throw new System.ArgumentNullException(
                        nameof(options.XApiKey),
                        "XApiKey is required but was not configured. Provide it via appsettings.json or the options delegate."
                    );
                var clientId =
                    options.ClientId
                    ?? throw new System.ArgumentNullException(
                        nameof(options.ClientId),
                        "ClientId is required but was not configured. Provide it via appsettings.json or the options delegate."
                    );
                var clientSecret =
                    options.ClientSecret
                    ?? throw new System.ArgumentNullException(
                        nameof(options.ClientSecret),
                        "ClientSecret is required but was not configured. Provide it via appsettings.json or the options delegate."
                    );

                return new SeedInferredAuthExplicitClient(
                    xApiKey,
                    clientId,
                    clientSecret,
                    options.Scope,
                    clientOptions
                );
            }
        );

        Microsoft.Extensions.DependencyInjection.Extensions.ServiceCollectionDescriptorExtensions.TryAddScoped<ISeedInferredAuthExplicitClient>(
            services,
            provider => provider.GetRequiredService<SeedInferredAuthExplicitClient>()
        );

        Microsoft.Extensions.DependencyInjection.Extensions.ServiceCollectionDescriptorExtensions.TryAddScoped<IAuthClient>(
            services,
            provider => provider.GetRequiredService<SeedInferredAuthExplicitClient>().Auth
        );
        Microsoft.Extensions.DependencyInjection.Extensions.ServiceCollectionDescriptorExtensions.TryAddScoped<AuthClient>(
            services,
            provider =>
                (AuthClient)provider.GetRequiredService<SeedInferredAuthExplicitClient>().Auth
        );
        Microsoft.Extensions.DependencyInjection.Extensions.ServiceCollectionDescriptorExtensions.TryAddScoped<SeedInferredAuthExplicit.NestedNoAuth.INestedNoAuthClient>(
            services,
            provider => provider.GetRequiredService<SeedInferredAuthExplicitClient>().NestedNoAuth
        );
        Microsoft.Extensions.DependencyInjection.Extensions.ServiceCollectionDescriptorExtensions.TryAddScoped<SeedInferredAuthExplicit.NestedNoAuth.NestedNoAuthClient>(
            services,
            provider =>
                (SeedInferredAuthExplicit.NestedNoAuth.NestedNoAuthClient)
                    provider.GetRequiredService<SeedInferredAuthExplicitClient>().NestedNoAuth
        );
        Microsoft.Extensions.DependencyInjection.Extensions.ServiceCollectionDescriptorExtensions.TryAddScoped<SeedInferredAuthExplicit.Nested.INestedClient>(
            services,
            provider => provider.GetRequiredService<SeedInferredAuthExplicitClient>().Nested
        );
        Microsoft.Extensions.DependencyInjection.Extensions.ServiceCollectionDescriptorExtensions.TryAddScoped<SeedInferredAuthExplicit.Nested.NestedClient>(
            services,
            provider =>
                (SeedInferredAuthExplicit.Nested.NestedClient)
                    provider.GetRequiredService<SeedInferredAuthExplicitClient>().Nested
        );
        Microsoft.Extensions.DependencyInjection.Extensions.ServiceCollectionDescriptorExtensions.TryAddScoped<ISimpleClient>(
            services,
            provider => provider.GetRequiredService<SeedInferredAuthExplicitClient>().Simple
        );
        Microsoft.Extensions.DependencyInjection.Extensions.ServiceCollectionDescriptorExtensions.TryAddScoped<SimpleClient>(
            services,
            provider =>
                (SimpleClient)provider.GetRequiredService<SeedInferredAuthExplicitClient>().Simple
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
