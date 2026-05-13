namespace SeedBasicAuth;

/// <summary>
/// Authentication option for the SDK.
/// Pass one of the sealed `Auth` subclasses (`Auth.ClientCredentials`, `Auth.Bearer`, `Auth.ApiKey`, `Auth.Basic`) appropriate to the API's auth scheme.
/// </summary>
public abstract class Auth
{
    private Auth() { }

    /// <summary>
    /// Authenticate using HTTP basic auth (username + password).
    /// </summary>
    public sealed class Basic : Auth
    {
        /// <summary>
        /// The username used for HTTP basic auth.
        /// </summary>
        public required string Username { get;
#if NET5_0_OR_GREATER
            init;
#else
            set;
#endif
        }

        /// <summary>
        /// The password used for HTTP basic auth.
        /// </summary>
        public required string Password { get;
#if NET5_0_OR_GREATER
            init;
#else
            set;
#endif
        }
    }
}
