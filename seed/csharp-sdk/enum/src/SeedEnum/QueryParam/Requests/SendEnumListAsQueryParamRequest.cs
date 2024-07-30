using OneOf;
using SeedEnum;

#nullable enable

namespace SeedEnum;

public record SendEnumListAsQueryParamRequest
{
    public required Operand Operand { get; }

    public Operand? MaybeOperand { get; }

    public required OneOf<Color, Operand> OperandOrColor { get; }

    public OneOf<Color, Operand>? MaybeOperandOrColor { get; }
}
