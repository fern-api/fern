using System.Text.Json.Serialization;

namespace SeedTrace;

public class GetTraceResponsesPageRequest
{
    [JsonPropertyName("offset")]
    public int? Offset { get; init; }
}
