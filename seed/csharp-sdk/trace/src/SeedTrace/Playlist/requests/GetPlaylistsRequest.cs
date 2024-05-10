namespace SeedTrace;

public class GetPlaylistsRequest
{
    public int? Limit { get; init; }

    /// <summary>
    /// i'm another field
    /// </summary>
    public string OtherField { get; init; }

    /// <summary>
    /// I'm a multiline
    /// description
    /// </summary>
    public string MultiLineDocs { get; init; }

    public string? OptionalMultipleField { get; init; }

    public string MultipleField { get; init; }
}
