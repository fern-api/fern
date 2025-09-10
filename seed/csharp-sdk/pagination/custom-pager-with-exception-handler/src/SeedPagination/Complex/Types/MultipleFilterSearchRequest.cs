using System.Text.Json;
using System.Text.Json.Serialization;
using OneOf;
using SeedPagination.Core;

namespace SeedPagination;

[Serializable]
public record MultipleFilterSearchRequest : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("operator")]
    public MultipleFilterSearchRequestOperator? Operator { get; set; }

    [JsonPropertyName("value")]
    public OneOf<
        IEnumerable<MultipleFilterSearchRequest>,
        IEnumerable<SingleFilterSearchRequest>
    >? Value { get; set; }

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
