using System.Text.Json.Serialization;

namespace SeedExhaustiveClient.Types;

public class ObjectWithOptionalField
{
    [JsonPropertyName("string")]
    public string? String { get; init; }

    [JsonPropertyName("integer")]
    public int? Integer { get; init; }

    [JsonPropertyName("long")]
    public long? Long { get; init; }

    [JsonPropertyName("double")]
    public double? Double { get; init; }

    [JsonPropertyName("bool")]
    public bool? Bool { get; init; }

    [JsonPropertyName("datetime")]
    public DateTime? Datetime { get; init; }

    [JsonPropertyName("date")]
    public DateOnly? Date { get; init; }

    [JsonPropertyName("uuid")]
    public Guid? Uuid { get; init; }

    [JsonPropertyName("base64")]
    public string? Base64 { get; init; }

    [JsonPropertyName("list")]
    public List<string>? List { get; init; }

    [JsonPropertyName("set")]
    public HashSet<string>? Set { get; init; }

    [JsonPropertyName("map")]
    public Dictionary<int, string>? Map { get; init; }
}
