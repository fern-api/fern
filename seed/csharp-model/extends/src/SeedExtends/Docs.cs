using System.Text.Json.Serialization;

#nullable enable

namespace SeedExtends;

public record Docs
{
    [JsonPropertyName("docs")]
    public required string Docs_ { get; set; }
}
