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

    public IEnumerable<string> OptionalMultipleField { get; set; } = new List<string>();

    public IEnumerable<string> MultipleField { get; set; } = new List<string>();
}
