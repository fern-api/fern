namespace SeedWebsocketOauth.Core;

internal sealed record WebSocketDefaults
{
    public required string TenantName { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    }

    public required Func<string> GetToken { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    }

    public required string Environment { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    }
}
