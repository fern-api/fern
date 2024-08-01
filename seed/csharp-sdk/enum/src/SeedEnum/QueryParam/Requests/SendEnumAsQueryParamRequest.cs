using OneOf;
using SeedEnum;

#nullable enable

namespace SeedEnum;

public record SendEnumAsQueryParamRequest
{
    public required Operand Operand { get; set; }

    public Operand? MaybeOperand { get; set; }

    public required OneOf<Color, Operand> OperandOrColor { get; set; }

    public OneOf<Color, Operand>? MaybeOperandOrColor { get; set; }
}
