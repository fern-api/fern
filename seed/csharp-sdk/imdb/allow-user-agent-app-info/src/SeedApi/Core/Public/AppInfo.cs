namespace SeedApi;

/// <summary>
/// Application information appended to the `User-Agent` header as an RFC 9110 product token
/// (`{Name}/{Version} ({Comment})`). Caller-supplied values are sanitized before being written.
/// </summary>
public sealed record AppInfo
{
    /// <summary>
    /// The product name. Required; when null, empty, or whitespace the `User-Agent` is left unchanged.
    /// </summary>
    public required string Name { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    }

    /// <summary>
    /// The optional product version. Omitted from the token when null or blank.
    /// </summary>
    public string? Version { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    }

    /// <summary>
    /// An optional comment (e.g. a homepage URL). Omitted from the token when null or blank.
    /// </summary>
    public string? Comment { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    }
}
