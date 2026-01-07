using System.Text.Json;
using System.Text.Json.Serialization;
using SeedPagination.Core;

namespace SeedPagination;

[Serializable]
public record SingleFilterSearchRequest : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [Optional]
    [JsonPropertyName("field")]
    public string? Field { get; set; }

    [Optional]
    [JsonPropertyName("operator")]
    public SingleFilterSearchRequestOperator? Operator { get; set; }

    [Optional]
    [JsonPropertyName("value")]
    public string? Value { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    void IJsonOnDeserialized.OnDeserialized() =>
        AdditionalProperties.CopyFromExtensionData(_extensionData);

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
