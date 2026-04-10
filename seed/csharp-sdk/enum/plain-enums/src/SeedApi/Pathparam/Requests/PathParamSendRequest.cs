using global::System.Text.Json.Serialization;
using OneOf;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record PathParamSendRequest
{
    [JsonIgnore]
    public required Operand Operand { get; set; }

    [JsonIgnore]
    public required OneOf<Color, Operand> OperandOrColor { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
