namespace SeedWebsocketOauth;

internal sealed record WebSocketDefaults
{
    public string? TenantName { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    }

    /// <summary>
    /// A function that returns the raw access token (without Bearer prefix) for WebSocket authentication.
    /// </summary>
    public Func<string>? GetToken { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    }
}
