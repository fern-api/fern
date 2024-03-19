using System.Text.Json.Serialization

namespace SeedTraceClient

public class GetTraceResponsesPageRequest
{
    [JsonPropertyName("offset")]
    public int? Offset { get; init; }
}
