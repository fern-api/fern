using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public record ListType
{
    [JsonPropertyName("valueType")]
    public required object ValueType { get; set; }

    /// <summary>
    /// Whether this list is fixed-size (for languages that supports fixed-size lists). Defaults to false.
    /// </summary>
    [JsonPropertyName("isFixedLength")]
    public bool? IsFixedLength { get; set; }
}
