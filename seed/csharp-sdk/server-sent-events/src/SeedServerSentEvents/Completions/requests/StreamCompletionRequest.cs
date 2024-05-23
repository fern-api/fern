using System.Text.Json.Serialization;

namespace SeedServerSentEvents;

public class StreamCompletionRequest
{
    [JsonPropertyName("query")]
    public string Query { get; init; }
}
