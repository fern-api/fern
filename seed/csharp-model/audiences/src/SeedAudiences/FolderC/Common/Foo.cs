using System.Text.Json.Serialization;

#nullable enable

namespace SeedAudiences.FolderC;

public record Foo
{
    [JsonPropertyName("bar_property")]
    public required Guid BarProperty { get; init; }
}
