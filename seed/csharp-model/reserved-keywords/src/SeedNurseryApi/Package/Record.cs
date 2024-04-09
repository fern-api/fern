using System.Text.Json.Serialization;

namespace SeedNurseryApi;

public class Record
{
    [JsonPropertyName("foo")]
    public List<Dictionary<string, string>> Foo { get; init; }

    [JsonPropertyName("3d")]
    public int _3D { get; init; }
}
