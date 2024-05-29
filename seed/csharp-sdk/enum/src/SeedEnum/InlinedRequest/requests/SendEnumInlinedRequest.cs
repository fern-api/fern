using System.Text.Json.Serialization;
using OneOf;
using SeedEnum;

#nullable enable

namespace SeedEnum;

public class SendEnumInlinedRequest
{
    [JsonPropertyName("operand")]
    public Operand Operand { get; init; }

    [JsonPropertyName("maybeOperand")]
    public Operand? MaybeOperand { get; init; }

    [JsonPropertyName("operandOrColor")]
    public OneOf<Color, Operand> OperandOrColor { get; init; }

    [JsonPropertyName("maybeOperandOrColor")]
    public OneOf<Color, Operand>? MaybeOperandOrColor { get; init; }
}
