using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record RuleCreateRequest
{
    [JsonPropertyName("name")]
    public required string Name { get; set; }

    /// <summary>
    /// Execution context for the rule, excluding the prod environment.
    /// </summary>
    [JsonPropertyName("executionContext")]
    public required RuleCreateRequestExecutionContext ExecutionContext { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
