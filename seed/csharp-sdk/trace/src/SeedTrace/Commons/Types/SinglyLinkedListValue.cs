using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public record SinglyLinkedListValue
{
    [JsonPropertyName("head")]
    public string? Head { get; set; }

    [JsonPropertyName("nodes")]
    public Dictionary<string, SinglyLinkedListNodeValue> Nodes { get; set; } =
        new Dictionary<string, SinglyLinkedListNodeValue>();
}
