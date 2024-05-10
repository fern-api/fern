using OneOf;
using SeedEnum;

namespace SeedEnum;

public class SendEnumAsQueryParamRequest
{
    public Operand Operand { get; init; }

    public List<Operand?> MaybeOperand { get; init; }

    public OneOf<Color, Operand> OperandOrColor { get; init; }

    public List<OneOf<Color, Operand>?> MaybeOperandOrColor { get; init; }
}
