using global::System.Text.Json.Serialization;
using SeedNullableOptional.Core;
using global::System.Text.Json;

namespace SeedNullableOptional;

/// <summary>
/// Request body for testing deserialization of null values
/// </summary>
[JsonConverter(typeof(DeserializationTestRequest.JsonConverter))][Serializable]
public record DeserializationTestRequest
{
    [JsonPropertyName("requiredString")]
    public required string RequiredString { get; set; }

    [Nullable][JsonPropertyName("nullableString")]
    public string? NullableString { get; set; }

    [Optional][JsonPropertyName("optionalString")]
    public string? OptionalString { get; set; }

    [Nullable, Optional][JsonPropertyName("optionalNullableString")]
    public Optional<string?> OptionalNullableString { get; set; }

    [Nullable][JsonPropertyName("nullableEnum")]
    public UserRole? NullableEnum { get; set; }

    [Optional][JsonPropertyName("optionalEnum")]
    public UserStatus? OptionalEnum { get; set; }

    [Nullable][JsonPropertyName("nullableUnion")]
    public NotificationMethod? NullableUnion { get; set; }

    [Optional][JsonPropertyName("optionalUnion")]
    public SearchResult? OptionalUnion { get; set; }

    [Nullable][JsonPropertyName("nullableList")]
    public IEnumerable<string>? NullableList { get; set; }

    [Nullable][JsonPropertyName("nullableMap")]
    public Dictionary<string, int>? NullableMap { get; set; }

    [Nullable][JsonPropertyName("nullableObject")]
    public Address? NullableObject { get; set; }

    [Optional][JsonPropertyName("optionalObject")]
    public Organization? OptionalObject { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();
    /// <inheritdoc />
    public override string ToString() {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<DeserializationTestRequest>
    {
        public override bool CanConvert(global::System.Type typeToConvert) => typeof(DeserializationTestRequest).IsAssignableFrom(typeToConvert);

        public override DeserializationTestRequest? Read(ref Utf8JsonReader reader, global::System.Type typeToConvert, JsonSerializerOptions options) {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }
            
            string _requiredString = default;
            string? _nullableString = default;
            var _optionalString = string?.Undefined;
            var _optionalNullableString = Optional<string?>.Undefined;
            UserRole? _nullableEnum = default;
            var _optionalEnum = UserStatus?.Undefined;
            NotificationMethod? _nullableUnion = default;
            var _optionalUnion = SearchResult?.Undefined;
            IEnumerable<string>? _nullableList = default;
            Dictionary<string, int>? _nullableMap = default;
            Address? _nullableObject = default;
            var _optionalObject = Organization?.Undefined;
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
                        _optionalString = string?.Of(JsonSerializer.Deserialize<string>(ref reader, options));
                        break;
                    case "optionalNullableString":
                        _optionalNullableString = Optional<string?>.Of(JsonSerializer.Deserialize<string?>(ref reader, options));
                        break;
                    case "nullableEnum":
                        _nullableEnum = JsonSerializer.Deserialize<UserRole?>(ref reader, options);
                        break;
                    case "optionalEnum":
                        _optionalEnum = UserStatus?.Of(JsonSerializer.Deserialize<UserStatus>(ref reader, options));
                        break;
                    case "nullableUnion":
                        _nullableUnion = JsonSerializer.Deserialize<NotificationMethod?>(ref reader, options);
                        break;
                    case "optionalUnion":
                        _optionalUnion = SearchResult?.Of(JsonSerializer.Deserialize<SearchResult>(ref reader, options));
                        break;
                    case "nullableList":
                        _nullableList = JsonSerializer.Deserialize<IEnumerable<string>?>(ref reader, options);
                        break;
                    case "nullableMap":
                        _nullableMap = JsonSerializer.Deserialize<Dictionary<string, int>?>(ref reader, options);
                        break;
                    case "nullableObject":
                        _nullableObject = JsonSerializer.Deserialize<Address?>(ref reader, options);
                        break;
                    case "optionalObject":
                        _optionalObject = Organization?.Of(JsonSerializer.Deserialize<Organization>(ref reader, options));
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
            }
;
        }

        public override void Write(Utf8JsonWriter writer, DeserializationTestRequest value, JsonSerializerOptions options) {
            writer.WriteStartObject();
            writer.WritePropertyName("requiredString");
            JsonSerializer.Serialize(writer, value.RequiredString, options);
            writer.WritePropertyName("nullableString");
            JsonSerializer.Serialize(writer, value.NullableString, options);
            if (value.OptionalString.IsDefined)
            {
                writer.WritePropertyName("optionalString");
                JsonSerializer.Serialize(writer, value.OptionalString.Value, options);
            }
            if (value.OptionalNullableString.IsDefined)
            {
                writer.WritePropertyName("optionalNullableString");
                JsonSerializer.Serialize(writer, value.OptionalNullableString.Value, options);
            }
            writer.WritePropertyName("nullableEnum");
            JsonSerializer.Serialize(writer, value.NullableEnum, options);
            if (value.OptionalEnum.IsDefined)
            {
                writer.WritePropertyName("optionalEnum");
                JsonSerializer.Serialize(writer, value.OptionalEnum.Value, options);
            }
            writer.WritePropertyName("nullableUnion");
            JsonSerializer.Serialize(writer, value.NullableUnion, options);
            if (value.OptionalUnion.IsDefined)
            {
                writer.WritePropertyName("optionalUnion");
                JsonSerializer.Serialize(writer, value.OptionalUnion.Value, options);
            }
            writer.WritePropertyName("nullableList");
            JsonSerializer.Serialize(writer, value.NullableList, options);
            writer.WritePropertyName("nullableMap");
            JsonSerializer.Serialize(writer, value.NullableMap, options);
            writer.WritePropertyName("nullableObject");
            JsonSerializer.Serialize(writer, value.NullableObject, options);
            if (value.OptionalObject.IsDefined)
            {
                writer.WritePropertyName("optionalObject");
                JsonSerializer.Serialize(writer, value.OptionalObject.Value, options);
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
