namespace SeedIdempotencyHeaders.Core;

internal interface IIdempotentRequestOptions : IRequestOptions
{
    public string IdempotencyKey { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    }
    public int IdempotencyExpiration { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    }
    internal Dictionary<string, string> GetIdempotencyHeaders();
}
