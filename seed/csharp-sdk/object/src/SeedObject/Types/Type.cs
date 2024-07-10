using System.Text.Json.Serialization;
using SeedObject;

#nullable enable

namespace SeedObject;

public record Type
{
    [JsonPropertyName("one")]
    public required int One { get; init; }

    [JsonPropertyName("two")]
    public required double Two { get; init; }

    [JsonPropertyName("three")]
    public required string Three { get; init; }

    [JsonPropertyName("four")]
    public required bool Four { get; init; }

    [JsonPropertyName("five")]
    public required long Five { get; init; }

    [JsonPropertyName("six")]
    public required DateTime Six { get; init; }

    [JsonPropertyName("seven")]
    public required DateOnly Seven { get; init; }

    [JsonPropertyName("eight")]
    public required Guid Eight { get; init; }

    [JsonPropertyName("nine")]
    public required string Nine { get; init; }

    [JsonPropertyName("ten")]
    public IEnumerable<int> Ten { get; init; } = new List<int>();

    [JsonPropertyName("eleven")]
    public HashSet<double> Eleven { get; init; } = new HashSet<double>();

    [JsonPropertyName("twelve")]
    public Dictionary<string, bool> Twelve { get; init; } = new Dictionary<string, bool>();

    [JsonPropertyName("thirteen")]
    public long? Thirteen { get; init; }

    [JsonPropertyName("fourteen")]
    public required object Fourteen { get; init; }

    [JsonPropertyName("fifteen")]
    public IEnumerable<IEnumerable<int>> Fifteen { get; init; } = new List<IEnumerable<int>>();

    [JsonPropertyName("sixteen")]
    public IEnumerable<Dictionary<string, int>> Sixteen { get; init; } =
        new List<Dictionary<string, int>>();

    [JsonPropertyName("seventeen")]
    public IEnumerable<Guid> Seventeen { get; init; } = new List<Guid>();

    [JsonPropertyName("eighteen")]
    public required string Eighteen { get; init; }

    [JsonPropertyName("nineteen")]
    public required Name Nineteen { get; init; }
}
