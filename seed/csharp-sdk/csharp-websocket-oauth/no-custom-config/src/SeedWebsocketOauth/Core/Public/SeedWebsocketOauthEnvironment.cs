namespace SeedWebsocketOauth;

[Serializable]
public class SeedWebsocketOauthEnvironment
{
    public static readonly SeedWebsocketOauthEnvironment Production =
        new SeedWebsocketOauthEnvironment
        {
            Default = "https://api.example.com",
            Wss = "wss://realtime.example.com",
        };

    public static readonly SeedWebsocketOauthEnvironment Staging = new SeedWebsocketOauthEnvironment
    {
        Default = "https://api.staging.example.com",
        Wss = "wss://realtime.staging.example.com",
    };

    /// <summary>
    /// URL for the default service
    /// </summary>
    public string Default { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    }

    /// <summary>
    /// URL for the wss service
    /// </summary>
    public string Wss { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    }
}
