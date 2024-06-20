using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public class ListType
{
    [JsonPropertyName("valueType")]
    public object ValueType { get; init; }

    /// <summary>
    /// Whether this list is fixed-size (for languages that supports fixed-size lists). Defaults to false.
    /// </summary>
    [JsonPropertyName("isFixedLength")]
    public bool? IsFixedLength { get; init; }
}
