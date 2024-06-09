using OneOf;
using SeedEnum;

#nullable enable

namespace SeedEnum;

public class SendEnumListAsQueryParamRequest
{
    public Operand Operand { get; init; }

    public Operand? MaybeOperand { get; init; }

    public OneOf<Color, Operand> OperandOrColor { get; init; }

    public OneOf<Color, Operand>? MaybeOperandOrColor { get; init; }
}
