using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

public record TraceResponsesPageV2
{
    /// <summary>
    /// If present, use this to load subsequent pages.
    /// The offset is the id of the next trace response to load.
    /// </summary>
    [JsonPropertyName("offset")]
    public int? Offset { get; set; }

    [JsonPropertyName("traceResponses")]
    public IEnumerable<TraceResponseV2> TraceResponses { get; set; } = new List<TraceResponseV2>();

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
