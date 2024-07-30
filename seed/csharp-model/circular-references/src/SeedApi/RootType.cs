using System.Text.Json.Serialization;

#nullable enable

namespace SeedApi;

public record RootType
{
    [JsonPropertyName("s")]
    public required string S { get; set; }
}
