using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;
using ProtoDataV1Grpc = Data.V1.Grpc;

namespace SeedApi;

[JsonConverter(typeof(UploadResponse.JsonConverter))]
[Serializable]
public record UploadResponse
{
    [JsonPropertyName("count")]
    public uint? Count { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <summary>
    /// Returns a new UploadResponse type from its Protobuf-equivalent representation.
    /// </summary>
    internal static UploadResponse FromProto(ProtoDataV1Grpc.UploadResponse value)
    {
        return new UploadResponse { Count = value.Count };
    }

    /// <summary>
    /// Maps the UploadResponse type into its Protobuf-equivalent representation.
    /// </summary>
    internal ProtoDataV1Grpc.UploadResponse ToProto()
    {
        var result = new ProtoDataV1Grpc.UploadResponse();
        if (Count != null)
        {
            result.Count = Count ?? 0;
        }
        return result;
    }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<UploadResponse>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(UploadResponse).IsAssignableFrom(typeToConvert);

        public override UploadResponse? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            uint? _count = default;
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
                    case "count":
                        _count = JsonSerializer.Deserialize<uint?>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new UploadResponse
            {
                Count = _count,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            UploadResponse value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            if (value.Count != null)
            {
                writer.WritePropertyName("count");
                JsonSerializer.Serialize(writer, value.Count, options);
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

        public override UploadResponse ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<UploadResponse>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            UploadResponse value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
