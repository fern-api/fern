namespace SeedTrace;

public record GetPlaylistsRequest
{
    public int? Limit { get; }

    /// <summary>
    /// i'm another field
    /// </summary>
    public required string OtherField { get; }

    /// <summary>
    /// I'm a multiline
    /// description
    /// </summary>
    public required string MultiLineDocs { get; }

    public string? OptionalMultipleField { get; }

    public required string MultipleField { get; }
}
