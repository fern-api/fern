using System.Text.Json.Serialization;
using OneOf;
using SeedEnum.Core;

namespace SeedEnum;

[Serializable]
public record SendEnumInlinedRequest
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
