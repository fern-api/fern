using System.Text.Json;
using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[Serializable]
public record RecordingResponseNotification : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("submissionId")]
    public required string SubmissionId { get; set; }

    [JsonPropertyName("testCaseId")]
    public string? TestCaseId { get; set; }

    [JsonPropertyName("lineNumber")]
    public required int LineNumber { get; set; }

    [JsonPropertyName("lightweightStackInfo")]
    public required LightweightStackframeInformation LightweightStackInfo { get; set; }

    [JsonPropertyName("tracedFile")]
    public TracedFile? TracedFile { get; set; }

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
