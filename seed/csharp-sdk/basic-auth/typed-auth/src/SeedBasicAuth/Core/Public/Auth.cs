namespace SeedBasicAuth;

/// <summary>
/// Authentication option for the SDK.
/// Pass one of the sealed `Auth` subclasses (`Auth.ClientCredentials`, `Auth.Bearer`, `Auth.ApiKey`, `Auth.Basic`) appropriate to the API's auth scheme.
/// </summary>
public abstract class Auth
{
    private protected Auth() { }

    internal virtual (string Name, string Value)? BuildAuthHeader() => null;

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

        internal override (string Name, string Value)? BuildAuthHeader() =>
            (
                "Authorization",
                "Basic "
                    + global::System.Convert.ToBase64String(
                        global::System.Text.Encoding.UTF8.GetBytes(Username + ":" + Password)
                    )
            );
    }
}
