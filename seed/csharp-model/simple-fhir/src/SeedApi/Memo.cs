using System.Text.Json;
using System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

public record Memo
{
    [JsonPropertyName("description")]
    public required string Description { get; set; }

    [JsonPropertyName("account")]
    public Account? Account { get; set; }

    /// <summary>
    /// Additional properties received from the response, if any.
    /// </summary>
    [JsonExtensionData]
    public IDictionary<string, JsonElement> AdditionalProperties =
        new Dictionary<string, JsonElement>();

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
