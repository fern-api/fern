using global::System.Text.Json.Serialization;
using OneOf;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record QueryParamSendRequest
{
    [JsonIgnore]
    public required Operand Operand { get; set; }

    [JsonIgnore]
    public Operand? MaybeOperand { get; set; }

    [JsonIgnore]
    public required Color OperandOrColor { get; set; }

    [JsonIgnore]
    public OneOf<Color, Operand>? MaybeOperandOrColor { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
