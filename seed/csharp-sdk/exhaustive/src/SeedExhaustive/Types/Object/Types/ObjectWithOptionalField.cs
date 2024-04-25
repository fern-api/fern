using System.Text.Json.Serialization;

namespace SeedExhaustive.Types;

public class ObjectWithOptionalField
{
    [JsonPropertyName("string")]
    public List<string?> String { get; init; }

    [JsonPropertyName("integer")]
    public List<int?> Integer { get; init; }

    [JsonPropertyName("long")]
    public List<long?> Long { get; init; }

    [JsonPropertyName("double")]
    public List<double?> Double { get; init; }

    [JsonPropertyName("bool")]
    public List<bool?> Bool { get; init; }

    [JsonPropertyName("datetime")]
    public List<DateTime?> Datetime { get; init; }

    [JsonPropertyName("date")]
    public List<DateOnly?> Date { get; init; }

    [JsonPropertyName("uuid")]
    public List<Guid?> Uuid { get; init; }

    [JsonPropertyName("base64")]
    public List<string?> Base64 { get; init; }

    [JsonPropertyName("list")]
    public List<List<List<string>>?> List { get; init; }

    [JsonPropertyName("set")]
    public List<List<HashSet<string>>?> Set { get; init; }

    [JsonPropertyName("map")]
    public List<List<Dictionary<int, string>>?> Map { get; init; }
}
