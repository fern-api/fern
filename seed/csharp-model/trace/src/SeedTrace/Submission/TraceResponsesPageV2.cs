using System.Text.Json.Serialization;
using SeedTrace;

namespace SeedTrace;

public class TraceResponsesPageV2
{
    /// <summary>
    /// If present, use this to load subseqent pages.
    The offset is the id of the next trace response to load.
    /// </summary>
    [JsonPropertyName("offset")]
    public int? Offset { get; init; }

    [JsonPropertyName("traceResponses")]
    public List<TraceResponseV2> TraceResponses { get; init; }
}
