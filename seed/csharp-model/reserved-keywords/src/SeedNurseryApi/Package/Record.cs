using System.Text.Json.Serialization;

#nullable enable

namespace SeedNurseryApi;

public record Record
{
    [JsonPropertyName("foo")]
    public Dictionary<string, string> Foo { get; set; } = new Dictionary<string, string>();

    [JsonPropertyName("3d")]
    public required int _3D { get; set; }
}
