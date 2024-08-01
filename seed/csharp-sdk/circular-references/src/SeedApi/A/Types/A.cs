using System.Text.Json.Serialization;

#nullable enable

namespace SeedApi;

public record A
{
    [JsonPropertyName("s")]
    public required string S { get; set; }
}
