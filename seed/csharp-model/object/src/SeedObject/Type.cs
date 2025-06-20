using System.Text.Json;
using System.Text.Json.Serialization;
using SeedObject.Core;

namespace SeedObject;

/// <summary>
/// Exercises all of the built-in types.
/// </summary>
[Serializable]
public record Type
{
    [JsonPropertyName("one")]
    public required int One { get; set; }

    [JsonPropertyName("two")]
    public required double Two { get; set; }

    [JsonPropertyName("three")]
    public required string Three { get; set; }

    [JsonPropertyName("four")]
    public required bool Four { get; set; }

    [JsonPropertyName("five")]
    public required long Five { get; set; }

    [JsonPropertyName("six")]
    public required DateTime Six { get; set; }

    [JsonPropertyName("seven")]
    public required DateOnly Seven { get; set; }

    [JsonPropertyName("eight")]
    public required string Eight { get; set; }

    [JsonPropertyName("nine")]
    public required string Nine { get; set; }

    [JsonPropertyName("ten")]
    public IEnumerable<int> Ten { get; set; } = new List<int>();

    [JsonPropertyName("eleven")]
    public HashSet<double> Eleven { get; set; } = new HashSet<double>();

    [JsonPropertyName("twelve")]
    public Dictionary<string, bool> Twelve { get; set; } = new Dictionary<string, bool>();

    [JsonPropertyName("thirteen")]
    public long? Thirteen { get; set; }

    [JsonPropertyName("fourteen")]
    public required object Fourteen { get; set; }

    [JsonPropertyName("fifteen")]
    public IEnumerable<IEnumerable<int>> Fifteen { get; set; } = new List<IEnumerable<int>>();

    [JsonPropertyName("sixteen")]
    public IEnumerable<Dictionary<string, int>> Sixteen { get; set; } =
        new List<Dictionary<string, int>>();

    [JsonPropertyName("seventeen")]
    public IEnumerable<string> Seventeen { get; set; } = new List<string>();

    [JsonPropertyName("eighteen")]
    public string Eighteen { get; set; } = "eighteen";

    [JsonPropertyName("nineteen")]
    public required Name Nineteen { get; set; }

    [JsonPropertyName("twenty")]
    public required uint Twenty { get; set; }

    [JsonPropertyName("twentyone")]
    public required ulong Twentyone { get; set; }

    [JsonPropertyName("twentytwo")]
    public required float Twentytwo { get; set; }

    [JsonPropertyName("twentythree")]
    public required string Twentythree { get; set; }

    [JsonPropertyName("twentyfour")]
    public DateTime? Twentyfour { get; set; }

    [JsonPropertyName("twentyfive")]
    public DateOnly? Twentyfive { get; set; }

    /// <summary>
    /// Additional properties received from the response, if any.
    /// </summary>
    /// <remarks>
    /// [EXPERIMENTAL] This API is experimental and may change in future releases.
    /// </remarks>
    [JsonExtensionData]
    public IDictionary<string, JsonElement> AdditionalProperties { get; internal set; } =
        new Dictionary<string, JsonElement>();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
