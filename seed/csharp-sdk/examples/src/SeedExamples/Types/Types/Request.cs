using System.Text.Json.Serialization;

#nullable enable

namespace SeedExamples;

public record Request
{
    [JsonPropertyName("request")]
    public required object Request_ { get; set; }
}
