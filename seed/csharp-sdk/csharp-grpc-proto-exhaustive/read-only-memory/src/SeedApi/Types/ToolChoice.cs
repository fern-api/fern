using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;
using ProtoDataV1Grpc = Data.V1.Grpc;

namespace SeedApi;

[JsonConverter(typeof(ToolChoice.JsonConverter))]
[Serializable]
public record ToolChoice
{
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

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<ToolChoice>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(ToolChoice).IsAssignableFrom(typeToConvert);

        public override ToolChoice? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            ToolMode? _mode = default;
            string? _functionName = default;
            var extensionData = new Dictionary<string, JsonElement>();

            if (reader.TokenType != JsonTokenType.StartObject)
            {
                throw new JsonException("Expected StartObject");
            }

            while (reader.Read() && reader.TokenType != JsonTokenType.EndObject)
            {
                var propertyName = reader.GetString();
                reader.Read();

                switch (propertyName)
                {
                    case "mode":
                        _mode = JsonSerializer.Deserialize<ToolMode?>(ref reader, options);
                        break;
                    case "function_name":
                        _functionName = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new ToolChoice
            {
                Mode = _mode,
                FunctionName = _functionName,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            ToolChoice value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            if (value.Mode != null)
            {
                writer.WritePropertyName("mode");
                JsonSerializer.Serialize(writer, value.Mode, options);
            }
            if (value.FunctionName != null)
            {
                writer.WritePropertyName("function_name");
                JsonSerializer.Serialize(writer, value.FunctionName, options);
            }
            if (value.AdditionalProperties != null)
            {
                foreach (var kvp in value.AdditionalProperties)
                {
                    writer.WritePropertyName(kvp.Key);
                    kvp.Value.WriteTo(writer);
                }
            }
            writer.WriteEndObject();
        }

        public override ToolChoice ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<ToolChoice>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            ToolChoice value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
