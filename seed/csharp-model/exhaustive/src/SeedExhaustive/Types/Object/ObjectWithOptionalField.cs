using System.Text.Json.Serialization;

#nullable enable

namespace SeedExhaustive.Types;

public record ObjectWithOptionalField
{
    /// <summary>
    /// This is a rather long descriptor of this single field in a more complex type. If you ask me I think this is a pretty good description for this field all things considered.
    /// </summary>
    [JsonPropertyName("string")]
    public string? String { get; }

    [JsonPropertyName("integer")]
    public int? Integer { get; }

    [JsonPropertyName("long")]
    public long? Long { get; }

    [JsonPropertyName("double")]
    public double? Double { get; }

    [JsonPropertyName("bool")]
    public bool? Bool { get; }

    [JsonPropertyName("datetime")]
    public DateTime? Datetime { get; }

    [JsonPropertyName("date")]
    public DateOnly? Date { get; }

    [JsonPropertyName("uuid")]
    public string? Uuid { get; }

    [JsonPropertyName("base64")]
    public string? Base64 { get; }

    [JsonPropertyName("list")]
    public IEnumerable<string>? List { get; }

    [JsonPropertyName("set")]
    public HashSet<string>? Set { get; }

    [JsonPropertyName("map")]
    public Dictionary<int, string>? Map { get; }

    [JsonPropertyName("bigint")]
    public int? Bigint { get; }
}
