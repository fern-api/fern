using System.Text.Json.Serialization;

#nullable enable

namespace SeedPackageYml;

public class EchoRequest
{
    [JsonPropertyName("name")]
    public string Name { get; init; }

    [JsonPropertyName("size")]
    public int Size { get; init; }
}
