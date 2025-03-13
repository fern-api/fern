using System.Text.Json.Serialization;
using OneOf;
using SeedEnum.Core;

namespace SeedEnum;

public record SendEnumListAsQueryParamRequest
{
    [JsonIgnore]
    public IEnumerable<Operand> Operand { get; set; } = new List<Operand>();

    [JsonIgnore]
    public IEnumerable<Operand> MaybeOperand { get; set; } = new List<Operand>();

    [JsonIgnore]
    public IEnumerable<OneOf<Color, Operand>> OperandOrColor { get; set; } =
        new List<OneOf<Color, Operand>>();

    [JsonIgnore]
    public IEnumerable<OneOf<Color, Operand>> MaybeOperandOrColor { get; set; } =
        new List<OneOf<Color, Operand>>();

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
