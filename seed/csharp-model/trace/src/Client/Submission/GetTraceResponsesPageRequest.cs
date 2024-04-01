using System.Text.Json.Serialization;

namespace Client;

public class GetTraceResponsesPageRequest
{
    [JsonPropertyName("offset")]
    public int? Offset { get; init; }
}
