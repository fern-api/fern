namespace SeedApi;

[Serializable]
public class SeedApiEnvironment
{
    public static readonly SeedApiEnvironment RegionalApiServer = new SeedApiEnvironment
    {
        Base = "https://api.us-east-1.prod.example.com/v1",
        Auth = "https://auth.us-east-1.example.com",
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
}
