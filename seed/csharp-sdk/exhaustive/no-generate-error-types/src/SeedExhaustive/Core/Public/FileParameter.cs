namespace SeedExhaustive;

/// <summary>
/// File parameter for uploading files.
/// </summary>
public record FileParameter : IDisposable
#if NET6_0_OR_GREATER
        , IAsyncDisposable
#endif
{
    private bool _disposed;

    /// <summary>
    /// The name of the file to be uploaded.
    /// </summary>
    public string? FileName { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    }

    /// <summary>
    /// The content type of the file to be uploaded.
    /// </summary>
    public string? ContentType { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    }

    /// <summary>
    /// The content of the file to be uploaded.
    /// </summary>
    public required Stream Stream { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    }

    /// <inheritdoc/>
    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }

    /// <inheritdoc cref="Dispose()" />
    protected virtual void Dispose(bool disposing)
    {
        if (_disposed)
            return;
        if (disposing)
        {
            Stream.Dispose();
        }

        _disposed = true;
    }

#if NET6_0_OR_GREATER
    /// <inheritdoc/>
    public async ValueTask DisposeAsync()
    {
        if (!_disposed)
        {
            await Stream.DisposeAsync().ConfigureAwait(false);
            _disposed = true;
        }

        GC.SuppressFinalize(this);
    }
#endif

    public static implicit operator FileParameter(Stream stream) => new() { Stream = stream };
}
