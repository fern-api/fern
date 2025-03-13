namespace SeedTrace;

/// <summary>
/// File parameter for uploading files.
/// </summary>
public record FileParameter
{
    /// <summary>
    /// The name of the file to be uploaded.
    /// </summary>
    public string? FileName { get; init; }

    /// <summary>
    /// The content type of the file to be uploaded.
    /// </summary>
    public string? ContentType { get; init; }

    /// <summary>
    /// The content of the file to be uploaded.
    /// </summary>
    public required Stream Stream { get; init; }

    public static implicit operator FileParameter(Stream stream) => new() { Stream = stream };
}
