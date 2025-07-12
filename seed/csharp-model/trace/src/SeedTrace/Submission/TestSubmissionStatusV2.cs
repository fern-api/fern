using System.Text.Json;
using System.Text.Json.Serialization;
using SeedTrace.Core;
using SeedTrace.V2;

namespace SeedTrace;

[Serializable]
public record TestSubmissionStatusV2 : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("updates")]
    public IEnumerable<TestSubmissionUpdate> Updates { get; set; } =
        new List<TestSubmissionUpdate>();

    [JsonPropertyName("problemId")]
    public required string ProblemId { get; set; }

    [JsonPropertyName("problemVersion")]
    public required int ProblemVersion { get; set; }

    [JsonPropertyName("problemInfo")]
    public required ProblemInfoV2 ProblemInfo { get; set; }

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
