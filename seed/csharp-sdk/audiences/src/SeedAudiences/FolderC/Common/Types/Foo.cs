using System.Text.Json.Serialization;

#nullable enable

namespace SeedAudiences.FolderC;

public class Foo
{
    [JsonPropertyName("bar_property")]
    public Guid BarProperty { get; init; }
}
