using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;
using ProtoDataV1Grpc = Data.V1.Grpc;

namespace SeedApi;

[JsonConverter(typeof(Usage.JsonConverter))]
[Serializable]
public record Usage
{
    [JsonPropertyName("units")]
    public uint? Units { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <summary>
    /// Returns a new Usage type from its Protobuf-equivalent representation.
    /// </summary>
    internal static Usage FromProto(ProtoDataV1Grpc.Usage value)
    {
        return new Usage { Units = value.Units };
    }

    /// <summary>
    /// Maps the Usage type into its Protobuf-equivalent representation.
    /// </summary>
    internal ProtoDataV1Grpc.Usage ToProto()
    {
        var result = new ProtoDataV1Grpc.Usage();
        if (Units != null)
        {
            result.Units = Units ?? 0;
        }
        return result;
    }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<Usage>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(Usage).IsAssignableFrom(typeToConvert);

        public override Usage? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            uint? _units = default;
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
                    case "units":
                        _units = JsonSerializer.Deserialize<uint?>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new Usage
            {
                Units = _units,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            Usage value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            if (value.Units != null)
            {
                writer.WritePropertyName("units");
                JsonSerializer.Serialize(writer, value.Units, options);
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
    }
}
