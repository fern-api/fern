namespace SeedTrace;

public record GetPlaylistsRequest
{
    public int? Limit { get; init; }

    /// <summary>
    /// i'm another field
    /// </summary>
    public required string OtherField { get; init; }

    /// <summary>
    /// I'm a multiline
    /// description
    /// </summary>
    public required string MultiLineDocs { get; init; }

    public string? OptionalMultipleField { get; init; }

    public required string MultipleField { get; init; }
}
