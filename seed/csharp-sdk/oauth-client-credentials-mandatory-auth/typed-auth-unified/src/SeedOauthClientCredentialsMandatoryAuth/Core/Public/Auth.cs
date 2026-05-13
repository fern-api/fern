namespace SeedOauthClientCredentialsMandatoryAuth;

/// <summary>
/// Authentication option for the SDK.
/// Pass one of the sealed `Auth` subclasses (`Auth.ClientCredentials`, `Auth.Bearer`, `Auth.ApiKey`, `Auth.Basic`) appropriate to the API's auth scheme.
/// </summary>
public abstract class Auth
{
    private Auth() { }

    /// <summary>
    /// Authenticate using OAuth client credentials.
    /// The SDK exchanges the client id/secret for an access token automatically and refreshes it as needed.
    /// </summary>
    public sealed class ClientCredentials : Auth
    {
        /// <summary>
        /// The clientId used to fetch OAuth access tokens.
        /// </summary>
        public required string ClientId { get;
#if NET5_0_OR_GREATER
            init;
#else
            set;
#endif
        }

        /// <summary>
        /// The clientSecret used to fetch OAuth access tokens.
        /// </summary>
        public required string ClientSecret { get;
#if NET5_0_OR_GREATER
            init;
#else
            set;
#endif
        }
    }

    /// <summary>
    /// Authenticate using a pre-fetched bearer token sent in the Authorization header.
    /// </summary>
    public sealed class Bearer : Auth
    {
        /// <summary>
        /// The bearer token sent in the Authorization header.
        /// </summary>
        public required string Token { get;
#if NET5_0_OR_GREATER
            init;
#else
            set;
#endif
        }
    }
}
