using System.Text.Json.Serialization;

namespace SeedAudiencesClient.FolderC;

public class Foo
{
    [JsonPropertyName("bar_property")]
    public Guid BarProperty { get; init; }
}
