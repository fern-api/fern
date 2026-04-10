using global::System.Text.Json.Serialization;
using OneOf;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record InlinedRequestSendRequest
{
    [JsonPropertyName("operand")]
    public required Operand Operand { get; set; }

    [JsonPropertyName("maybeOperand")]
    public Operand? MaybeOperand { get; set; }

    [JsonPropertyName("operandOrColor")]
    public required OneOf<Color, Operand> OperandOrColor { get; set; }

    [JsonPropertyName("maybeOperandOrColor")]
    public OneOf<Color, Operand>? MaybeOperandOrColor { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
