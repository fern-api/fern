using OneOf;
using SeedEnum;

#nullable enable

namespace SeedEnum;

public record SendEnumListAsQueryParamRequest
{
    public IEnumerable<Operand> Operand { get; set; } = new List<Operand>();

    public IEnumerable<Operand> MaybeOperand { get; set; } = new List<Operand>();

    public IEnumerable<OneOf<Color, Operand>> OperandOrColor { get; set; } =
        new List<OneOf<Color, Operand>>();

    public IEnumerable<OneOf<Color, Operand>> MaybeOperandOrColor { get; set; } =
        new List<OneOf<Color, Operand>>();
}
