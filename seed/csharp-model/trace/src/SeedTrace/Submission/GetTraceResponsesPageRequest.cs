using System.Text.Json.Serialization;

namespace SeedTrace;

public class GetTraceResponsesPageRequest
{
    [JsonPropertyName("offset")]
    public List<int?> Offset { get; init; }
}
