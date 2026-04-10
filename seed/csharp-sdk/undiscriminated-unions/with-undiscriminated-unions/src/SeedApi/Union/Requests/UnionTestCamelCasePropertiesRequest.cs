using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record UnionTestCamelCasePropertiesRequest
{
    [JsonPropertyName("paymentMethod")]
    public required PaymentMethodUnion PaymentMethod { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
