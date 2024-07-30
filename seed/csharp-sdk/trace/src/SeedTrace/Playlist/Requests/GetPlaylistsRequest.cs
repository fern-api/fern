namespace SeedTrace;

public record GetPlaylistsRequest
{
    public int? Limit { get; set; }

    /// <summary>
    /// i'm another field
    /// </summary>
    public required string OtherField { get; set; }

    /// <summary>
    /// I'm a multiline
    /// description
    /// </summary>
    public required string MultiLineDocs { get; set; }

    public string? OptionalMultipleField { get; set; }

    public required string MultipleField { get; set; }
}
