using System.Text.Json.Serialization;
using SeedExhaustive.Core;

namespace SeedExhaustive.Types;

public record ObjectWithOptionalField
{
    /// <summary>
    /// This is a rather long descriptor of this single field in a more complex type. If you ask me I think this is a pretty good description for this field all things considered.
    /// </summary>
    [JsonPropertyName("string")]
    public string? String { get; set; }

    [JsonPropertyName("integer")]
    public int? Integer { get; set; }

    [JsonPropertyName("long")]
    public long? Long { get; set; }

    [JsonPropertyName("double")]
    public double? Double { get; set; }

    [JsonPropertyName("bool")]
    public bool? Bool { get; set; }

    [JsonPropertyName("datetime")]
    public DateTime? Datetime { get; set; }

    [JsonPropertyName("date")]
    public DateOnly? Date { get; set; }

    [JsonPropertyName("uuid")]
    public string? Uuid { get; set; }

    [JsonPropertyName("base64")]
    public string? Base64 { get; set; }

    [JsonPropertyName("list")]
    public IEnumerable<string>? List { get; set; }

    [JsonPropertyName("set")]
    public HashSet<string>? Set { get; set; }

    [JsonPropertyName("map")]
    public Dictionary<int, string>? Map { get; set; }

    [JsonPropertyName("bigint")]
    public string? Bigint { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
