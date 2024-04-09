using System.Text.Json.Serialization;
using SeedObjectsWithImports.Commons;

namespace SeedObjectsWithImports;

public class Node
{
    [JsonPropertyName("id")]
    public string Id { get; init; }

    [JsonPropertyName("label")]
    public List<string?> Label { get; init; }

    [JsonPropertyName("metadata")]
    public List<Metadata?> Metadata { get; init; }
}
