namespace SeedWebsocketMultiUrl;

[Serializable]
public class SeedWebsocketMultiUrlEnvironment
{
    public static readonly SeedWebsocketMultiUrlEnvironment Production =
        new SeedWebsocketMultiUrlEnvironment
        {
            Rest = "https://api.production.com",
            Wss = "wss://ws.production.com",
        };

    public static readonly SeedWebsocketMultiUrlEnvironment Staging =
        new SeedWebsocketMultiUrlEnvironment
        {
            Rest = "https://api.staging.com",
            Wss = "wss://ws.staging.com",
        };

    /// <summary>
    /// URL for the rest service
    /// </summary>
    public string Rest { get;
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
