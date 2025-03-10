using System.Text.Json;
using System.Text.Json.Serialization;
using SeedIdempotencyHeaders.Core;

namespace SeedIdempotencyHeaders;

public record CreatePaymentRequest
{
    [JsonPropertyName("amount")]
    public required int Amount { get; set; }

    [JsonPropertyName("currency")]
    public required Currency Currency { get; set; }

    /// <summary>
    /// Additional properties received from the response, if any.
    /// </summary>
    [JsonExtensionData]
    public IDictionary<string, JsonElement> AdditionalProperties { get; internal set; } =
        new Dictionary<string, JsonElement>();

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
