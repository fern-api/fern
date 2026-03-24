using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedNullableOptional.Core;

namespace SeedNullableOptional;

/// <summary>
/// Request body for testing deserialization of null values
/// </summary>
[JsonConverter(typeof(DeserializationTestRequest.JsonConverter))]
[Serializable]
public record DeserializationTestRequest
{
    [JsonPropertyName("requiredString")]
    public required string RequiredString { get; set; }

    [JsonPropertyName("nullableString")]
    public string? NullableString { get; set; }

    [JsonPropertyName("optionalString")]
    public string? OptionalString { get; set; }

    [JsonPropertyName("optionalNullableString")]
    public string? OptionalNullableString { get; set; }

    [JsonPropertyName("nullableEnum")]
    public UserRole? NullableEnum { get; set; }

    [JsonPropertyName("optionalEnum")]
    public UserStatus? OptionalEnum { get; set; }

    [JsonPropertyName("nullableUnion")]
    public NotificationMethod? NullableUnion { get; set; }

    [JsonPropertyName("optionalUnion")]
    public SearchResult? OptionalUnion { get; set; }

    [JsonPropertyName("nullableList")]
    public IEnumerable<string>? NullableList { get; set; }

    [JsonPropertyName("nullableMap")]
    public Dictionary<string, int>? NullableMap { get; set; }

    [JsonPropertyName("nullableObject")]
    public Address? NullableObject { get; set; }

    [JsonPropertyName("optionalObject")]
    public Organization? OptionalObject { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<DeserializationTestRequest>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(DeserializationTestRequest).IsAssignableFrom(typeToConvert);

        public override DeserializationTestRequest? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string _requiredString = default;
            string? _nullableString = default;
            string? _optionalString = default;
            string? _optionalNullableString = default;
            UserRole? _nullableEnum = default;
            UserStatus? _optionalEnum = default;
            NotificationMethod? _nullableUnion = default;
            SearchResult? _optionalUnion = default;
            IEnumerable<string>? _nullableList = default;
            Dictionary<string, int>? _nullableMap = default;
            Address? _nullableObject = default;
            Organization? _optionalObject = default;
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
                    case "requiredString":
                        _requiredString = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "nullableString":
                        _nullableString = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    case "optionalString":
                        _optionalString = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    case "optionalNullableString":
                        _optionalNullableString = JsonSerializer.Deserialize<string?>(
                            ref reader,
                            options
                        );
                        break;
                    case "nullableEnum":
                        _nullableEnum = JsonSerializer.Deserialize<UserRole?>(ref reader, options);
                        break;
                    case "optionalEnum":
                        _optionalEnum = JsonSerializer.Deserialize<UserStatus?>(
                            ref reader,
                            options
                        );
                        break;
                    case "nullableUnion":
                        _nullableUnion = JsonSerializer.Deserialize<NotificationMethod?>(
                            ref reader,
                            options
                        );
                        break;
                    case "optionalUnion":
                        _optionalUnion = JsonSerializer.Deserialize<SearchResult?>(
                            ref reader,
                            options
                        );
                        break;
                    case "nullableList":
                        _nullableList = JsonSerializer.Deserialize<IEnumerable<string>?>(
                            ref reader,
                            options
                        );
                        break;
                    case "nullableMap":
                        _nullableMap = JsonSerializer.Deserialize<Dictionary<string, int>?>(
                            ref reader,
                            options
                        );
                        break;
                    case "nullableObject":
                        _nullableObject = JsonSerializer.Deserialize<Address?>(ref reader, options);
                        break;
                    case "optionalObject":
                        _optionalObject = JsonSerializer.Deserialize<Organization?>(
                            ref reader,
                            options
                        );
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new DeserializationTestRequest
            {
                RequiredString = _requiredString,
                NullableString = _nullableString,
                OptionalString = _optionalString,
                OptionalNullableString = _optionalNullableString,
                NullableEnum = _nullableEnum,
                OptionalEnum = _optionalEnum,
                NullableUnion = _nullableUnion,
                OptionalUnion = _optionalUnion,
                NullableList = _nullableList,
                NullableMap = _nullableMap,
                NullableObject = _nullableObject,
                OptionalObject = _optionalObject,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            DeserializationTestRequest value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("requiredString");
            JsonSerializer.Serialize(writer, value.RequiredString, options);
            if (value.NullableString != null)
            {
                writer.WritePropertyName("nullableString");
                JsonSerializer.Serialize(writer, value.NullableString, options);
            }
            if (value.OptionalString != null)
            {
                writer.WritePropertyName("optionalString");
                JsonSerializer.Serialize(writer, value.OptionalString, options);
            }
            if (value.OptionalNullableString != null)
            {
                writer.WritePropertyName("optionalNullableString");
                JsonSerializer.Serialize(writer, value.OptionalNullableString, options);
            }
            if (value.NullableEnum != null)
            {
                writer.WritePropertyName("nullableEnum");
                JsonSerializer.Serialize(writer, value.NullableEnum, options);
            }
            if (value.OptionalEnum != null)
            {
                writer.WritePropertyName("optionalEnum");
                JsonSerializer.Serialize(writer, value.OptionalEnum, options);
            }
            if (value.NullableUnion != null)
            {
                writer.WritePropertyName("nullableUnion");
                JsonSerializer.Serialize(writer, value.NullableUnion, options);
            }
            if (value.OptionalUnion != null)
            {
                writer.WritePropertyName("optionalUnion");
                JsonSerializer.Serialize(writer, value.OptionalUnion, options);
            }
            if (value.NullableList != null)
            {
                writer.WritePropertyName("nullableList");
                JsonSerializer.Serialize(writer, value.NullableList, options);
            }
            if (value.NullableMap != null)
            {
                writer.WritePropertyName("nullableMap");
                JsonSerializer.Serialize(writer, value.NullableMap, options);
            }
            if (value.NullableObject != null)
            {
                writer.WritePropertyName("nullableObject");
                JsonSerializer.Serialize(writer, value.NullableObject, options);
            }
            if (value.OptionalObject != null)
            {
                writer.WritePropertyName("optionalObject");
                JsonSerializer.Serialize(writer, value.OptionalObject, options);
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

        public override DeserializationTestRequest ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<DeserializationTestRequest>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            DeserializationTestRequest value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
