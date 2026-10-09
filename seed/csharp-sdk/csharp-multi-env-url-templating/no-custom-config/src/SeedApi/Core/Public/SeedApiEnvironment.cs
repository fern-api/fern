namespace SeedApi;

[Serializable]
public class SeedApiEnvironment
{
    public static readonly SeedApiEnvironment Production = new SeedApiEnvironment
    {
        Acme = "https://api.acme.com",
        Oauth = "https://oauth.acme.com",
    };

    public static readonly SeedApiEnvironment Staging = new SeedApiEnvironment
    {
        Acme = "https://api.stage.acme.com",
        Oauth = "https://oauth.stage.acme.com",
    };

    public static readonly SeedApiEnvironment Development = new SeedApiEnvironment
    {
        Acme = "https://api.dev.acme.com",
        Oauth = "https://oauth.dev.acme.com",
    };

    /// <summary>
    /// URL for the acme service
    /// </summary>
    public string Acme { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    }

    /// <summary>
    /// URL for the oauth service
    /// </summary>
    public string Oauth { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    }
}
