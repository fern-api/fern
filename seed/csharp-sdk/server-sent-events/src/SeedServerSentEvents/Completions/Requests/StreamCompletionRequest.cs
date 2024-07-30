using System.Text.Json.Serialization;

#nullable enable

namespace SeedServerSentEvents;

public record StreamCompletionRequest
{
    [JsonPropertyName("query")]
    public required string Query { get; set; }
}
