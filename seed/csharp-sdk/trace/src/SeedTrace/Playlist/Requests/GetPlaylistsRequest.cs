using SeedTrace.Core;

#nullable enable

namespace SeedTrace;

public record GetPlaylistsRequest
{
    public int? Limit { get; set; }

    /// <summary>
    /// i&#39;m another field
    /// </summary>
    public required string OtherField { get; set; }

    /// <summary>
    /// I&#39;m a multiline
    /// description
    /// </summary>
    public required string MultiLineDocs { get; set; }

    public IEnumerable<string> OptionalMultipleField { get; set; } = new List<string>();

    public IEnumerable<string> MultipleField { get; set; } = new List<string>();

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
