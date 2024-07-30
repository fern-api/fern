using System.Text.Json.Serialization;
using SeedExtends;

#nullable enable

namespace SeedExtends;

public record ExampleType : Docs
{
    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("docs")]
    public required string Docs { get; set; }
}
