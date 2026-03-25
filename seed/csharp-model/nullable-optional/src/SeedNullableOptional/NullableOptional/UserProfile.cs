using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedNullableOptional.Core;

namespace SeedNullableOptional;

/// <summary>
/// Test object with nullable and optional fields
/// </summary>
[JsonConverter(typeof(UserProfile.JsonConverter))]
[Serializable]
public record UserProfile
{
    [JsonPropertyName("id")]
    public required string Id { get; set; }

    [JsonPropertyName("username")]
    public required string Username { get; set; }

    [JsonPropertyName("nullableString")]
    public string? NullableString { get; set; }

    [JsonPropertyName("nullableInteger")]
    public int? NullableInteger { get; set; }

    [JsonPropertyName("nullableBoolean")]
    public bool? NullableBoolean { get; set; }

    [JsonPropertyName("nullableDate")]
    public DateTime? NullableDate { get; set; }

    [JsonPropertyName("nullableObject")]
    public Address? NullableObject { get; set; }

    [JsonPropertyName("nullableList")]
    public IEnumerable<string>? NullableList { get; set; }

    [JsonPropertyName("nullableMap")]
    public Dictionary<string, string>? NullableMap { get; set; }

    [JsonPropertyName("optionalString")]
    public string? OptionalString { get; set; }

    [JsonPropertyName("optionalInteger")]
    public int? OptionalInteger { get; set; }

    [JsonPropertyName("optionalBoolean")]
    public bool? OptionalBoolean { get; set; }

    [JsonPropertyName("optionalDate")]
    public DateTime? OptionalDate { get; set; }

    [JsonPropertyName("optionalObject")]
    public Address? OptionalObject { get; set; }

    [JsonPropertyName("optionalList")]
    public IEnumerable<string>? OptionalList { get; set; }

    [JsonPropertyName("optionalMap")]
    public Dictionary<string, string>? OptionalMap { get; set; }

    [JsonPropertyName("optionalNullableString")]
    public string? OptionalNullableString { get; set; }

    [JsonPropertyName("optionalNullableObject")]
    public Address? OptionalNullableObject { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<UserProfile>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(UserProfile).IsAssignableFrom(typeToConvert);

        public override UserProfile? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string _id = default;
            string _username = default;
            string? _nullableString = default;
            int? _nullableInteger = default;
            bool? _nullableBoolean = default;
            DateTime? _nullableDate = default;
            Address? _nullableObject = default;
            IEnumerable<string>? _nullableList = default;
            Dictionary<string, string>? _nullableMap = default;
            string? _optionalString = default;
            int? _optionalInteger = default;
            bool? _optionalBoolean = default;
            DateTime? _optionalDate = default;
            Address? _optionalObject = default;
            IEnumerable<string>? _optionalList = default;
            Dictionary<string, string>? _optionalMap = default;
            string? _optionalNullableString = default;
            Address? _optionalNullableObject = default;
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
                    case "id":
                        _id = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "username":
                        _username = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "nullableString":
                        _nullableString = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    case "nullableInteger":
                        _nullableInteger = JsonSerializer.Deserialize<int?>(ref reader, options);
                        break;
                    case "nullableBoolean":
                        _nullableBoolean = JsonSerializer.Deserialize<bool?>(ref reader, options);
                        break;
                    case "nullableDate":
                        _nullableDate = JsonSerializer.Deserialize<DateTime?>(ref reader, options);
                        break;
                    case "nullableObject":
                        _nullableObject = JsonSerializer.Deserialize<Address?>(ref reader, options);
                        break;
                    case "nullableList":
                        _nullableList = JsonSerializer.Deserialize<IEnumerable<string>?>(
                            ref reader,
                            options
                        );
                        break;
                    case "nullableMap":
                        _nullableMap = JsonSerializer.Deserialize<Dictionary<string, string>?>(
                            ref reader,
                            options
                        );
                        break;
                    case "optionalString":
                        _optionalString = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    case "optionalInteger":
                        _optionalInteger = JsonSerializer.Deserialize<int?>(ref reader, options);
                        break;
                    case "optionalBoolean":
                        _optionalBoolean = JsonSerializer.Deserialize<bool?>(ref reader, options);
                        break;
                    case "optionalDate":
                        _optionalDate = JsonSerializer.Deserialize<DateTime?>(ref reader, options);
                        break;
                    case "optionalObject":
                        _optionalObject = JsonSerializer.Deserialize<Address?>(ref reader, options);
                        break;
                    case "optionalList":
                        _optionalList = JsonSerializer.Deserialize<IEnumerable<string>?>(
                            ref reader,
                            options
                        );
                        break;
                    case "optionalMap":
                        _optionalMap = JsonSerializer.Deserialize<Dictionary<string, string>?>(
                            ref reader,
                            options
                        );
                        break;
                    case "optionalNullableString":
                        _optionalNullableString = JsonSerializer.Deserialize<string?>(
                            ref reader,
                            options
                        );
                        break;
                    case "optionalNullableObject":
                        _optionalNullableObject = JsonSerializer.Deserialize<Address?>(
                            ref reader,
                            options
                        );
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new UserProfile
            {
                Id = _id,
                Username = _username,
                NullableString = _nullableString,
                NullableInteger = _nullableInteger,
                NullableBoolean = _nullableBoolean,
                NullableDate = _nullableDate,
                NullableObject = _nullableObject,
                NullableList = _nullableList,
                NullableMap = _nullableMap,
                OptionalString = _optionalString,
                OptionalInteger = _optionalInteger,
                OptionalBoolean = _optionalBoolean,
                OptionalDate = _optionalDate,
                OptionalObject = _optionalObject,
                OptionalList = _optionalList,
                OptionalMap = _optionalMap,
                OptionalNullableString = _optionalNullableString,
                OptionalNullableObject = _optionalNullableObject,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            UserProfile value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("id");
            JsonSerializer.Serialize(writer, value.Id, options);
            writer.WritePropertyName("username");
            JsonSerializer.Serialize(writer, value.Username, options);
            if (value.NullableString is not null)
            {
                writer.WritePropertyName("nullableString");
                JsonSerializer.Serialize(writer, value.NullableString, options);
            }
            if (value.NullableInteger is not null)
            {
                writer.WritePropertyName("nullableInteger");
                JsonSerializer.Serialize(writer, value.NullableInteger, options);
            }
            if (value.NullableBoolean is not null)
            {
                writer.WritePropertyName("nullableBoolean");
                JsonSerializer.Serialize(writer, value.NullableBoolean, options);
            }
            if (value.NullableDate is not null)
            {
                writer.WritePropertyName("nullableDate");
                JsonSerializer.Serialize(writer, value.NullableDate, options);
            }
            if (value.NullableObject is not null)
            {
                writer.WritePropertyName("nullableObject");
                JsonSerializer.Serialize(writer, value.NullableObject, options);
            }
            if (value.NullableList is not null)
            {
                writer.WritePropertyName("nullableList");
                JsonSerializer.Serialize(writer, value.NullableList, options);
            }
            if (value.NullableMap is not null)
            {
                writer.WritePropertyName("nullableMap");
                JsonSerializer.Serialize(writer, value.NullableMap, options);
            }
            if (value.OptionalString is not null)
            {
                writer.WritePropertyName("optionalString");
                JsonSerializer.Serialize(writer, value.OptionalString, options);
            }
            if (value.OptionalInteger is not null)
            {
                writer.WritePropertyName("optionalInteger");
                JsonSerializer.Serialize(writer, value.OptionalInteger, options);
            }
            if (value.OptionalBoolean is not null)
            {
                writer.WritePropertyName("optionalBoolean");
                JsonSerializer.Serialize(writer, value.OptionalBoolean, options);
            }
            if (value.OptionalDate is not null)
            {
                writer.WritePropertyName("optionalDate");
                JsonSerializer.Serialize(writer, value.OptionalDate, options);
            }
            if (value.OptionalObject is not null)
            {
                writer.WritePropertyName("optionalObject");
                JsonSerializer.Serialize(writer, value.OptionalObject, options);
            }
            if (value.OptionalList is not null)
            {
                writer.WritePropertyName("optionalList");
                JsonSerializer.Serialize(writer, value.OptionalList, options);
            }
            if (value.OptionalMap is not null)
            {
                writer.WritePropertyName("optionalMap");
                JsonSerializer.Serialize(writer, value.OptionalMap, options);
            }
            if (value.OptionalNullableString is not null)
            {
                writer.WritePropertyName("optionalNullableString");
                JsonSerializer.Serialize(writer, value.OptionalNullableString, options);
            }
            if (value.OptionalNullableObject is not null)
            {
                writer.WritePropertyName("optionalNullableObject");
                JsonSerializer.Serialize(writer, value.OptionalNullableObject, options);
            }
            if (value.AdditionalProperties is not null)
            {
                foreach (var kvp in value.AdditionalProperties)
                {
                    writer.WritePropertyName(kvp.Key);
                    kvp.Value.WriteTo(writer);
                }
            }
            writer.WriteEndObject();
        }

        public override UserProfile ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<UserProfile>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            UserProfile value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
