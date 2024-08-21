using System.Text.Json.Serialization;

#nullable enable

namespace SeedAudiences.FolderC;

public record FolderCFoo
{
    [JsonPropertyName("bar_property")]
    public required string BarProperty { get; set; }
}
