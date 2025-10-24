namespace SeedNullableOptional;

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
    public string? FileName { get; set; }

    /// <summary>
    /// The content type of the file to be uploaded.
    /// </summary>
    public string? ContentType { get; set; }

    /// <summary>
    /// The content of the file to be uploaded.
    /// </summary>
    public required Stream Stream { get; set; }

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

    public static implicit operator FileParameter(System.IO.FileInfo fileInfo)
    {
        if (fileInfo == null)
        {
            throw new ArgumentNullException(nameof(fileInfo));
        }

        return new FileParameter
        {
            Stream = fileInfo.OpenRead(),
            FileName = fileInfo.Name,
            ContentType = GetContentTypeFromExtension(fileInfo.Extension),
        };
    }

    private static string GetContentTypeFromExtension(string extension)
    {
        if (string.IsNullOrEmpty(extension))
        {
            return "application/octet-stream";
        }

        var extensionLower = extension.ToLowerInvariant();
        if (!extensionLower.StartsWith("."))
        {
            extensionLower = "." + extensionLower;
        }

        return extensionLower switch
        {
            ".txt" => "text/plain",
            ".html" or ".htm" => "text/html",
            ".css" => "text/css",
            ".js" => "application/javascript",
            ".json" => "application/json",
            ".xml" => "application/xml",
            ".pdf" => "application/pdf",
            ".zip" => "application/zip",
            ".tar" => "application/x-tar",
            ".gz" => "application/gzip",
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".gif" => "image/gif",
            ".bmp" => "image/bmp",
            ".svg" => "image/svg+xml",
            ".webp" => "image/webp",
            ".ico" => "image/x-icon",
            ".mp3" => "audio/mpeg",
            ".wav" => "audio/wav",
            ".ogg" => "audio/ogg",
            ".mp4" => "video/mp4",
            ".webm" => "video/webm",
            ".avi" => "video/x-msvideo",
            ".mpeg" => "video/mpeg",
            ".doc" => "application/msword",
            ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ".xls" => "application/vnd.ms-excel",
            ".xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            ".ppt" => "application/vnd.ms-powerpoint",
            ".pptx" => "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            ".csv" => "text/csv",
            ".md" => "text/markdown",
            ".yaml" or ".yml" => "application/x-yaml",
            ".wasm" => "application/wasm",
            _ => "application/octet-stream",
        };
    }
}
