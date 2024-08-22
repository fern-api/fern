using System.Text.Json.Serialization;
using SeedCsharpNamespaceConflict.Core;

#nullable enable

namespace SeedCsharpNamespaceConflict;

public record Task
{
    [JsonPropertyName("id")]
    public required string Id { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
