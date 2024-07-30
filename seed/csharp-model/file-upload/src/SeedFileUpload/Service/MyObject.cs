using System.Text.Json.Serialization;

#nullable enable

namespace SeedFileUpload;

public record MyObject
{
    [JsonPropertyName("foo")]
    public required string Foo { get; set; }
}
