using System.Text.Json;
using System.Text.Json.Serialization;
using OneOf;
using SeedEnum.Core;

namespace SeedEnum;

public record SendEnumInlinedRequest
{
    [JsonPropertyName("operand")]
    public required Operand Operand { get; set; }

    [JsonPropertyName("maybeOperand")]
    public Operand? MaybeOperand { get; set; }

    [JsonPropertyName("operandOrColor")]
    public required OneOf<Color, Operand> OperandOrColor { get; set; }

    [JsonPropertyName("maybeOperandOrColor")]
    public OneOf<Color, Operand>? MaybeOperandOrColor { get; set; }

    /// <summary>
    /// Additional properties received from the response, if any.
    /// </summary>
    [JsonExtensionData]
    public IDictionary<string, JsonElement> AdditionalProperties { get; internal set; } =
        new Dictionary<string, JsonElement>();

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
