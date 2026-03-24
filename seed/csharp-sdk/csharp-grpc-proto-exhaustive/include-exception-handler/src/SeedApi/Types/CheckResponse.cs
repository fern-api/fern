using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;
using ProtoDataV1Grpc = Data.V1.Grpc;
using WellKnownProto = Google.Protobuf.WellKnownTypes;

namespace SeedApi;

[JsonConverter(typeof(CheckResponse.JsonConverter))]
[Serializable]
public record CheckResponse
{
    [JsonPropertyName("created_at")]
    public DateTime? CreatedAt { get; set; }

    [JsonPropertyName("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <summary>
    /// Returns a new CheckResponse type from its Protobuf-equivalent representation.
    /// </summary>
    internal static CheckResponse FromProto(ProtoDataV1Grpc.CheckResponse value)
    {
        return new CheckResponse
        {
            CreatedAt = value.CreatedAt?.ToDateTime(),
            UpdatedAt = value.UpdatedAt?.ToDateTime(),
        };
    }

    /// <summary>
    /// Maps the CheckResponse type into its Protobuf-equivalent representation.
    /// </summary>
    internal ProtoDataV1Grpc.CheckResponse ToProto()
    {
        var result = new ProtoDataV1Grpc.CheckResponse();
        if (CreatedAt != null)
        {
            result.CreatedAt = WellKnownProto.Timestamp.FromDateTime(
                CreatedAt.Value.ToUniversalTime()
            );
        }
        if (UpdatedAt != null)
        {
            result.UpdatedAt = WellKnownProto.Timestamp.FromDateTime(
                UpdatedAt.Value.ToUniversalTime()
            );
        }
        return result;
    }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<CheckResponse>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(CheckResponse).IsAssignableFrom(typeToConvert);

        public override CheckResponse? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            DateTime? _createdAt = default;
            DateTime? _updatedAt = default;
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
                    case "created_at":
                        _createdAt = JsonSerializer.Deserialize<DateTime?>(ref reader, options);
                        break;
                    case "updated_at":
                        _updatedAt = JsonSerializer.Deserialize<DateTime?>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new CheckResponse
            {
                CreatedAt = _createdAt,
                UpdatedAt = _updatedAt,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            CheckResponse value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            if (value.CreatedAt != null)
            {
                writer.WritePropertyName("created_at");
                JsonSerializer.Serialize(writer, value.CreatedAt, options);
            }
            if (value.UpdatedAt != null)
            {
                writer.WritePropertyName("updated_at");
                JsonSerializer.Serialize(writer, value.UpdatedAt, options);
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
