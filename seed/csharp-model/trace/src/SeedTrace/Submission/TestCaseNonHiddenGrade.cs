using System.Text.Json;
using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[Serializable]
public record TestCaseNonHiddenGrade : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("passed")]
    public required bool Passed { get; set; }

    [JsonPropertyName("actualResult")]
    public VariableValue? ActualResult { get; set; }

    [JsonPropertyName("exception")]
    public ExceptionV2? Exception { get; set; }

    [JsonPropertyName("stdout")]
    public required string Stdout { get; set; }

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
