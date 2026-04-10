using global::System.Text.Json.Serialization;
using OneOf;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record UnionTestCamelCasePropertiesRequest
{
    [JsonPropertyName("paymentMethod")]
    public required OneOf<TokenizeCard, ConvertToken> PaymentMethod { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
