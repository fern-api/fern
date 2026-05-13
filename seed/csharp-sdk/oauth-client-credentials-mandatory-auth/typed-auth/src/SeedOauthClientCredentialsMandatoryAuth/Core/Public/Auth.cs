namespace SeedOauthClientCredentialsMandatoryAuth;

/// <summary>
/// Authentication option for the SDK.
/// Use `Auth.ClientCredentials` for the OAuth client-credentials flow (recommended) or `Auth.Bearer` to supply a pre-fetched bearer token.
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
    /// Authenticate using a pre-fetched bearer token, bypassing the OAuth flow.
    /// Use this when callers manage token acquisition out-of-band; the SDK will not refresh the token.
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
