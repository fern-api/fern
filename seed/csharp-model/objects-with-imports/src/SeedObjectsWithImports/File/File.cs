using System.Text.Json.Serialization;
using SeedObjectsWithImports;
using SeedObjectsWithImports.Core;

#nullable enable

namespace SeedObjectsWithImports;

public class File
{
    [JsonPropertyName("name")]
    public string Name { get; init; }

    [JsonPropertyName("contents")]
    public string Contents { get; init; }

    [JsonPropertyName("info")]
    [JsonConverter(typeof(StringEnumSerializer<FileInfo>))]
    public FileInfo Info { get; init; }
}
