using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public class GetTraceResponsesPageRequest
{
    [JsonPropertyName("offset")]
    public int? Offset { get; init; }
}
