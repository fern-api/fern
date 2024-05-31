using System.Text.Json.Serialization;
using SeedObject;

#nullable enable

namespace SeedObject;

public class Type
{
    [JsonPropertyName("one")]
    public int One { get; init; }

    [JsonPropertyName("two")]
    public double Two { get; init; }

    [JsonPropertyName("three")]
    public string Three { get; init; }

    [JsonPropertyName("four")]
    public bool Four { get; init; }

    [JsonPropertyName("five")]
    public long Five { get; init; }

    [JsonPropertyName("six")]
    public DateTime Six { get; init; }

    [JsonPropertyName("seven")]
    public DateOnly Seven { get; init; }

    [JsonPropertyName("eight")]
    public Guid Eight { get; init; }

    [JsonPropertyName("nine")]
    public string Nine { get; init; }

    [JsonPropertyName("ten")]
    public IEnumerable<int> Ten { get; init; }

    [JsonPropertyName("eleven")]
    public HashSet<double> Eleven { get; init; }

    [JsonPropertyName("twelve")]
    public Dictionary<string, bool> Twelve { get; init; }

    [JsonPropertyName("thirteen")]
    public long? Thirteen { get; init; }

    [JsonPropertyName("fourteen")]
    public object Fourteen { get; init; }

    [JsonPropertyName("fifteen")]
    public IEnumerable<IEnumerable<int>> Fifteen { get; init; }

    [JsonPropertyName("sixteen")]
    public IEnumerable<Dictionary<string, int>> Sixteen { get; init; }

    [JsonPropertyName("seventeen")]
    public IEnumerable<Guid> Seventeen { get; init; }

    [JsonPropertyName("eighteen")]
    public string Eighteen { get; init; }

    [JsonPropertyName("nineteen")]
    public Name Nineteen { get; init; }
}
