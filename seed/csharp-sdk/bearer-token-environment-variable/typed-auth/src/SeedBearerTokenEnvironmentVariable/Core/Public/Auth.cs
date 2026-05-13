namespace SeedBearerTokenEnvironmentVariable;

/// <summary>
/// Authentication option for the SDK.
/// Pass one of the sealed `Auth` subclasses (`Auth.ClientCredentials`, `Auth.Bearer`, `Auth.ApiKey`, `Auth.Basic`) appropriate to the API's auth scheme.
/// </summary>
public abstract class Auth
{
    private Auth() { }

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
