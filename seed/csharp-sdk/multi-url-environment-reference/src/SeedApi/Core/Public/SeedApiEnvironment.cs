namespace SeedApi;

[Serializable]
public class SeedApiEnvironment
{
    public static readonly SeedApiEnvironment Production = new SeedApiEnvironment
    {
        Base = "https://api.example.com/2.0",
        Auth = "https://auth.example.com/oauth2",
        Upload = "https://upload.example.com/2.0",
    };

    /// <summary>
    /// URL for the Base service
    /// </summary>
    public string Base { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    }

    /// <summary>
    /// URL for the Auth service
    /// </summary>
    public string Auth { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    }

    /// <summary>
    /// URL for the Upload service
    /// </summary>
    public string Upload { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    }
}
