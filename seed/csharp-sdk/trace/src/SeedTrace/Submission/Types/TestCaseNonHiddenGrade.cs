using System.Text.Json;
using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[Serializable]
public record TestCaseNonHiddenGrade
{
    [JsonPropertyName("passed")]
    public required bool Passed { get; set; }

    [JsonPropertyName("actualResult")]
    public object? ActualResult { get; set; }

    [JsonPropertyName("exception")]
    public object? Exception { get; set; }

    [JsonPropertyName("stdout")]
    public required string Stdout { get; set; }

    /// <summary>
    /// Additional properties received from the response, if any.
    /// </summary>
    /// <remarks>
    /// [EXPERIMENTAL] This API is experimental and may change in future releases.
    /// </remarks>
    [JsonExtensionData]
    public IDictionary<string, JsonElement> AdditionalProperties { get; internal set; } =
        new Dictionary<string, JsonElement>();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
