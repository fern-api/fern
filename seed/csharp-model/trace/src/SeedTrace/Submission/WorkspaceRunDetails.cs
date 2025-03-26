using System.Text.Json;
using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

public record WorkspaceRunDetails
{
    [JsonPropertyName("exceptionV2")]
    public object? ExceptionV2 { get; set; }

    [JsonPropertyName("exception")]
    public ExceptionInfo? Exception { get; set; }

    [JsonPropertyName("stdout")]
    public required string Stdout { get; set; }

    /// <summary>
    /// Additional properties received from the response, if any.
    /// </summary>
    [JsonExtensionData]
    public IDictionary<string, JsonElement> AdditionalProperties { get; internal set; } =
        new Dictionary<string, JsonElement>();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
