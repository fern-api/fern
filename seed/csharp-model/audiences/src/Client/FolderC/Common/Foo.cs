using System.Text.Json.Serialization;

namespace Client.FolderC;

public class Foo
{
    [JsonPropertyName("bar_property")]
    public Guid BarProperty { get; init; }
}
