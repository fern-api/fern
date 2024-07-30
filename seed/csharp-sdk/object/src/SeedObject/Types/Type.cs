using System.Text.Json.Serialization;
using SeedObject;

#nullable enable

namespace SeedObject;

public record Type
{
    [JsonPropertyName("one")]
    public required int One { get; }

    [JsonPropertyName("two")]
    public required double Two { get; }

    [JsonPropertyName("three")]
    public required string Three { get; }

    [JsonPropertyName("four")]
    public required bool Four { get; }

    [JsonPropertyName("five")]
    public required long Five { get; }

    [JsonPropertyName("six")]
    public required DateTime Six { get; }

    [JsonPropertyName("seven")]
    public required DateOnly Seven { get; }

    [JsonPropertyName("eight")]
    public required string Eight { get; }

    [JsonPropertyName("nine")]
    public required string Nine { get; }

    [JsonPropertyName("ten")]
    public IEnumerable<int> Ten { get; } = new List<int>();

    [JsonPropertyName("eleven")]
    public HashSet<double> Eleven { get; } = new HashSet<double>();

    [JsonPropertyName("twelve")]
    public Dictionary<string, bool> Twelve { get; } = new Dictionary<string, bool>();

    [JsonPropertyName("thirteen")]
    public long? Thirteen { get; }

    [JsonPropertyName("fourteen")]
    public required object Fourteen { get; }

    [JsonPropertyName("fifteen")]
    public IEnumerable<IEnumerable<int>> Fifteen { get; } = new List<IEnumerable<int>>();

    [JsonPropertyName("sixteen")]
    public IEnumerable<Dictionary<string, int>> Sixteen { get; } =
        new List<Dictionary<string, int>>();

    [JsonPropertyName("seventeen")]
    public IEnumerable<string> Seventeen { get; } = new List<string>();

    [JsonPropertyName("eighteen")]
    public required string Eighteen { get; }

    [JsonPropertyName("nineteen")]
    public required Name Nineteen { get; }
}
