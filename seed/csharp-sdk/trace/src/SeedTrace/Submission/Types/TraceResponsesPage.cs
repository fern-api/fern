using System.Text.Json.Serialization;
using SeedTrace.Core;

#nullable enable

namespace SeedTrace;

public record TraceResponsesPage
{
    /// <summary>
    /// If present, use this to load subseqent pages.
    /// The offset is the id of the next trace response to load.
    /// </summary>
    [JsonPropertyName("offset")]
    public int? Offset { get; set; }

    [JsonPropertyName("traceResponses")]
    public IEnumerable<TraceResponse> TraceResponses { get; set; } = new List<TraceResponse>();

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
