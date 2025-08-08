using System.Text.Json;
using System.Text.Json.Serialization;

namespace SeedExamples;

[Serializable]
public record ExceptionInfo : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("exceptionType")]
    public required string ExceptionType { get; set; }

    [JsonPropertyName("exceptionMessage")]
    public required string ExceptionMessage { get; set; }

    [JsonPropertyName("exceptionStacktrace")]
    public required string ExceptionStacktrace { get; set; }

    [JsonIgnore]
    public SeedExamples.ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } =
        new();

    void IJsonOnDeserialized.OnDeserialized() =>
        AdditionalProperties.CopyFromExtensionData(_extensionData);

    /// <inheritdoc />
    public override string ToString()
    {
        return SeedExamples.Core.JsonUtils.Serialize(this);
    }
}
