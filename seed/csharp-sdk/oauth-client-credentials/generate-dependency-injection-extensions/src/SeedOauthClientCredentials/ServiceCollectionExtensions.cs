#if !NETFRAMEWORK

using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;

namespace SeedOauthClientCredentials;

public static class ServiceCollectionExtensions
{
    private static IServiceCollection AddSeedOauthClientCredentialsClientInternal(
        this IServiceCollection services
    )
    {
        services.AddHttpClient("SeedOauthClientCredentialsClient");

        Microsoft.Extensions.DependencyInjection.Extensions.ServiceCollectionDescriptorExtensions.TryAddScoped(
            services,
            provider =>
            {
                var options = provider
                    .GetRequiredService<Microsoft.Extensions.Options.IOptionsSnapshot<SeedOauthClientCredentialsClientOptions>>()
                    .Value;
                var httpClientFactory =
                    provider.GetRequiredService<System.Net.Http.IHttpClientFactory>();

                var clientOptions = new ClientOptions
                {
                    HttpClient = httpClientFactory.CreateClient("SeedOauthClientCredentialsClient"),
                    MaxRetries = options.MaxRetries,
                    Timeout = options.Timeout,
                    BaseUrl = !string.IsNullOrEmpty(options.BaseUrl) ? options.BaseUrl! : "",
                };

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

                return new SeedOauthClientCredentialsClient(
                    clientId,
                    clientSecret,
                    clientOptions
                );
            }
        );

        Microsoft.Extensions.DependencyInjection.Extensions.ServiceCollectionDescriptorExtensions.TryAddScoped<ISeedOauthClientCredentialsClient>(
            services,
            provider => provider.GetRequiredService<SeedOauthClientCredentialsClient>()
        );

        Microsoft.Extensions.DependencyInjection.Extensions.ServiceCollectionDescriptorExtensions.TryAddScoped<IAuthClient>(
            services,
            provider => provider.GetRequiredService<SeedOauthClientCredentialsClient>().Auth
        );
        Microsoft.Extensions.DependencyInjection.Extensions.ServiceCollectionDescriptorExtensions.TryAddScoped<AuthClient>(
            services,
            provider =>
                (AuthClient)provider.GetRequiredService<SeedOauthClientCredentialsClient>().Auth
        );
        Microsoft.Extensions.DependencyInjection.Extensions.ServiceCollectionDescriptorExtensions.TryAddScoped<SeedOauthClientCredentials.NestedNoAuth.INestedNoAuthClient>(
            services,
            provider => provider.GetRequiredService<SeedOauthClientCredentialsClient>().NestedNoAuth
        );
        Microsoft.Extensions.DependencyInjection.Extensions.ServiceCollectionDescriptorExtensions.TryAddScoped<SeedOauthClientCredentials.NestedNoAuth.NestedNoAuthClient>(
            services,
            provider =>
                (SeedOauthClientCredentials.NestedNoAuth.NestedNoAuthClient)
                    provider.GetRequiredService<SeedOauthClientCredentialsClient>().NestedNoAuth
        );
        Microsoft.Extensions.DependencyInjection.Extensions.ServiceCollectionDescriptorExtensions.TryAddScoped<SeedOauthClientCredentials.Nested.INestedClient>(
            services,
            provider => provider.GetRequiredService<SeedOauthClientCredentialsClient>().Nested
        );
        Microsoft.Extensions.DependencyInjection.Extensions.ServiceCollectionDescriptorExtensions.TryAddScoped<SeedOauthClientCredentials.Nested.NestedClient>(
            services,
            provider =>
                (SeedOauthClientCredentials.Nested.NestedClient)
                    provider.GetRequiredService<SeedOauthClientCredentialsClient>().Nested
        );
        Microsoft.Extensions.DependencyInjection.Extensions.ServiceCollectionDescriptorExtensions.TryAddScoped<ISimpleClient>(
            services,
            provider => provider.GetRequiredService<SeedOauthClientCredentialsClient>().Simple
        );
        Microsoft.Extensions.DependencyInjection.Extensions.ServiceCollectionDescriptorExtensions.TryAddScoped<SimpleClient>(
            services,
            provider =>
                (SimpleClient)provider.GetRequiredService<SeedOauthClientCredentialsClient>().Simple
        );

        return services;
    }

    /// <summary>
    /// Registers the <see cref="SeedOauthClientCredentialsClient"/> and related services in the dependency injection container. Configuration is read from the "SeedOauthClientCredentialsClient" section of the application's <see cref="IConfiguration"/>.
    /// </summary>
    public static IServiceCollection AddSeedOauthClientCredentialsClient(
        this IServiceCollection services
    )
    {
        services
            .AddOptions<SeedOauthClientCredentialsClientOptions>()
            .BindConfiguration("SeedOauthClientCredentialsClient");

        return services.AddSeedOauthClientCredentialsClientInternal();
    }

    /// <summary>
    /// Registers the <see cref="SeedOauthClientCredentialsClient"/> and related services in the dependency injection container with the specified configuration.
    /// </summary>
    public static IServiceCollection AddSeedOauthClientCredentialsClient(
        this IServiceCollection services,
        Action<SeedOauthClientCredentialsClientOptions> configure
    )
    {
        services.AddOptions<SeedOauthClientCredentialsClientOptions>().Configure(configure);

        return services.AddSeedOauthClientCredentialsClientInternal();
    }

    /// <summary>
    /// Registers the <see cref="SeedOauthClientCredentialsClient"/> and related services in the dependency injection container with configuration from the specified <see cref="IConfigurationSection"/>.
    /// </summary>
    public static IServiceCollection AddSeedOauthClientCredentialsClient(
        this IServiceCollection services,
        IConfigurationSection configurationSection
    )
    {
        services.AddOptions<SeedOauthClientCredentialsClientOptions>().Bind(configurationSection);

        return services.AddSeedOauthClientCredentialsClientInternal();
    }
}

#endif
