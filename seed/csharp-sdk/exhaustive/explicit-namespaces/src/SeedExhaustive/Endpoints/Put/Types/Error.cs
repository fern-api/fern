using System.Text.Json;
using System.Text.Json.Serialization;
using SeedExhaustive.Core;

namespace SeedExhaustive.Endpoints.Put;

public record Error
{
    [JsonPropertyName("category")]
    public required ErrorCategory Category { get; set; }

    [JsonPropertyName("code")]
    public required ErrorCode Code { get; set; }

    [JsonPropertyName("detail")]
    public string? Detail { get; set; }

    [JsonPropertyName("field")]
    public string? Field { get; set; }

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
