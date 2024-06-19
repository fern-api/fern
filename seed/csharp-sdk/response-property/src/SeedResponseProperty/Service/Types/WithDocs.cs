using System.Text.Json.Serialization;

#nullable enable

namespace SeedResponseProperty;

public class WithDocs
{
    [JsonPropertyName("docs")]
    public string Docs { get; init; }
}
