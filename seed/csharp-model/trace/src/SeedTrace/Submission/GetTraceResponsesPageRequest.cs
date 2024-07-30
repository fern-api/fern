using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public record GetTraceResponsesPageRequest
{
    [JsonPropertyName("offset")]
    public int? Offset { get; set; }
}
