using System.Text.Json.Serialization;

#nullable enable

namespace SeedNurseryApi;

public class Record
{
    [JsonPropertyName("foo")]
    public Dictionary<string, string> Foo { get; init; }

    [JsonPropertyName("3d")]
    public int _3D { get; init; }
}
