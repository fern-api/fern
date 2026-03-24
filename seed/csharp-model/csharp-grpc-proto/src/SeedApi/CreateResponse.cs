using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;
using ProtoUserV1 = User.V1;

namespace SeedApi;

[JsonConverter(typeof(CreateResponse.JsonConverter))]
[Serializable]
public record CreateResponse
{
    [JsonPropertyName("user")]
    public UserModel? User { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <summary>
    /// Returns a new CreateResponse type from its Protobuf-equivalent representation.
    /// </summary>
    internal static CreateResponse FromProto(ProtoUserV1.CreateResponse value)
    {
        return new CreateResponse
        {
            User = value.User != null ? SeedApi.UserModel.FromProto(value.User) : null,
        };
    }

    /// <summary>
    /// Maps the CreateResponse type into its Protobuf-equivalent representation.
    /// </summary>
    internal ProtoUserV1.CreateResponse ToProto()
    {
        var result = new ProtoUserV1.CreateResponse();
        if (User != null)
        {
            result.User = User.ToProto();
        }
        return result;
    }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<CreateResponse>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(CreateResponse).IsAssignableFrom(typeToConvert);

        public override CreateResponse? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            UserModel? _user = default;
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
                    case "user":
                        _user = JsonSerializer.Deserialize<UserModel?>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new CreateResponse
            {
                User = _user,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            CreateResponse value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            if (value.User != null)
            {
                writer.WritePropertyName("user");
                JsonSerializer.Serialize(writer, value.User, options);
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

        public override CreateResponse ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<CreateResponse>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            CreateResponse value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
