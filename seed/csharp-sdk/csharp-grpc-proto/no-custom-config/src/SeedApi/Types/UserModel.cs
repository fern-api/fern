using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;
using ProtoUserV1 = User.V1;

namespace SeedApi;

[JsonConverter(typeof(UserModel.JsonConverter))]
[Serializable]
public record UserModel
{
    [JsonPropertyName("username")]
    public string? Username { get; set; }

    [JsonPropertyName("email")]
    public string? Email { get; set; }

    [JsonPropertyName("age")]
    public uint? Age { get; set; }

    [JsonPropertyName("weight")]
    public float? Weight { get; set; }

    [JsonPropertyName("metadata")]
    public Metadata? Metadata { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <summary>
    /// Returns a new UserModel type from its Protobuf-equivalent representation.
    /// </summary>
    internal static UserModel FromProto(ProtoUserV1.UserModel value)
    {
        return new UserModel
        {
            Username = value.Username,
            Email = value.Email,
            Age = value.Age,
            Weight = value.Weight,
            Metadata = value.Metadata != null ? SeedApi.Metadata.FromProto(value.Metadata) : null,
        };
    }

    /// <summary>
    /// Maps the UserModel type into its Protobuf-equivalent representation.
    /// </summary>
    internal ProtoUserV1.UserModel ToProto()
    {
        var result = new ProtoUserV1.UserModel();
        if (Username != null)
        {
            result.Username = Username ?? "";
        }
        if (Email != null)
        {
            result.Email = Email ?? "";
        }
        if (Age != null)
        {
            result.Age = Age ?? 0;
        }
        if (Weight != null)
        {
            result.Weight = Weight ?? 0.0f;
        }
        if (Metadata != null)
        {
            result.Metadata = Metadata.ToProto();
        }
        return result;
    }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<UserModel>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(UserModel).IsAssignableFrom(typeToConvert);

        public override UserModel? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string? _username = default;
            string? _email = default;
            uint? _age = default;
            float? _weight = default;
            Metadata? _metadata = default;
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
                    case "username":
                        _username = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    case "email":
                        _email = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    case "age":
                        _age = JsonSerializer.Deserialize<uint?>(ref reader, options);
                        break;
                    case "weight":
                        _weight = JsonSerializer.Deserialize<float?>(ref reader, options);
                        break;
                    case "metadata":
                        _metadata = JsonSerializer.Deserialize<Metadata?>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new UserModel
            {
                Username = _username,
                Email = _email,
                Age = _age,
                Weight = _weight,
                Metadata = _metadata,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            UserModel value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            if (value.Username != null)
            {
                writer.WritePropertyName("username");
                JsonSerializer.Serialize(writer, value.Username, options);
            }
            if (value.Email != null)
            {
                writer.WritePropertyName("email");
                JsonSerializer.Serialize(writer, value.Email, options);
            }
            if (value.Age != null)
            {
                writer.WritePropertyName("age");
                JsonSerializer.Serialize(writer, value.Age, options);
            }
            if (value.Weight != null)
            {
                writer.WritePropertyName("weight");
                JsonSerializer.Serialize(writer, value.Weight, options);
            }
            if (value.Metadata != null)
            {
                writer.WritePropertyName("metadata");
                JsonSerializer.Serialize(writer, value.Metadata, options);
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

        public override UserModel ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<UserModel>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            UserModel value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
