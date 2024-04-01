using System.Text.Json.Serialization;
using SeedTrace;

namespace SeedTrace;

public class TraceResponsesPage
{
    /// <summary>
    /// If present, use this to load subseqent pages.
    /// The offset is the id of the next trace response to load.
    /// </summary>
    [JsonPropertyName("offset")]
    public int? Offset { get; init; }

    [JsonPropertyName("traceResponses")]
    public List<TraceResponse> TraceResponses { get; init; }
}
