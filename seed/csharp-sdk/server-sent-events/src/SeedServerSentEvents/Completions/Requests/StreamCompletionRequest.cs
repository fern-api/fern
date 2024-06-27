using System.Text.Json.Serialization;

#nullable enable

namespace SeedServerSentEvents;

public class StreamCompletionRequest
{
    [JsonPropertyName("query")]
    public string Query { get; init; }
}
