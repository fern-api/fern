using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

public record GetTraceResponsesPageRequest
{
    [JsonPropertyName("offset")]
    public int? Offset { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
