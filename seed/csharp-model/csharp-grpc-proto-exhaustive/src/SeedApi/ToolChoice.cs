using System.Text.Json;
using System.Text.Json.Serialization;
using SeedApi.Core;
using ProtoDataV1Grpc = Data.V1.Grpc;

namespace SeedApi;

[Serializable]
public record ToolChoice : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    /// <summary>
    /// Force the model to perform in a given mode.
    /// </summary>
    [JsonPropertyName("mode")]
    public ToolMode? Mode { get; set; }

    /// <summary>
    /// Force the model to call a particular function.
    /// </summary>
    [JsonPropertyName("function_name")]
    public string? FunctionName { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <summary>
    /// Returns a new ToolChoice type from its Protobuf-equivalent representation.
    /// </summary>
    internal static ToolChoice FromProto(ProtoDataV1Grpc.ToolChoice value)
    {
        return new ToolChoice
        {
            Mode = value.Mode switch
            {
                ProtoDataV1Grpc.ToolMode.Invalid => SeedApi.ToolMode.ToolModeInvalid,
                ProtoDataV1Grpc.ToolMode.Auto => SeedApi.ToolMode.ToolModeAuto,
                ProtoDataV1Grpc.ToolMode.None => SeedApi.ToolMode.ToolModeNone,
                ProtoDataV1Grpc.ToolMode.Required => SeedApi.ToolMode.ToolModeRequired,
                _ => throw new ArgumentException($"Unknown enum value: {value.Mode}"),
            },
            FunctionName = value.FunctionName,
        };
    }

    void IJsonOnDeserialized.OnDeserialized() =>
        AdditionalProperties.CopyFromExtensionData(_extensionData);

    /// <summary>
    /// Maps the ToolChoice type into its Protobuf-equivalent representation.
    /// </summary>
    internal ProtoDataV1Grpc.ToolChoice ToProto()
    {
        var result = new ProtoDataV1Grpc.ToolChoice();
        if (Mode != null)
        {
            result.Mode = Mode.Value.Value switch
            {
                SeedApi.ToolMode.Values.ToolModeInvalid => ProtoDataV1Grpc.ToolMode.Invalid,
                SeedApi.ToolMode.Values.ToolModeAuto => ProtoDataV1Grpc.ToolMode.Auto,
                SeedApi.ToolMode.Values.ToolModeNone => ProtoDataV1Grpc.ToolMode.None,
                SeedApi.ToolMode.Values.ToolModeRequired => ProtoDataV1Grpc.ToolMode.Required,
                _ => throw new ArgumentException($"Unknown enum value: {Mode.Value.Value}"),
            };
        }
        if (FunctionName != null)
        {
            result.FunctionName = FunctionName ?? "";
        }
        return result;
    }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
