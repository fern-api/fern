using System.Text.Json.Serialization;
using OneOf;
using SeedEnum;
using SeedEnum.Core;

#nullable enable

namespace SeedEnum;

public class SendEnumInlinedRequest
{
    [JsonPropertyName("operand")]
    [JsonConverter(typeof(StringEnumSerializer<Operand>))]
    public Operand Operand { get; init; }

    [JsonPropertyName("maybeOperand")]
    [JsonConverter(typeof(StringEnumSerializer<Operand>))]
    public Operand? MaybeOperand { get; init; }

    [JsonPropertyName("operandOrColor")]
    public OneOf<Color, Operand> OperandOrColor { get; init; }

    [JsonPropertyName("maybeOperandOrColor")]
    public OneOf<Color, Operand>? MaybeOperandOrColor { get; init; }
}
