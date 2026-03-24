using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedNullableOptional.Core;

namespace SeedNullableOptional;

/// <summary>
/// Test object with nullable enums, unions, and arrays
/// </summary>
[JsonConverter(typeof(ComplexProfile.JsonConverter))]
[Serializable]
public record ComplexProfile
{
    [JsonPropertyName("id")]
    public required string Id { get; set; }

    [JsonPropertyName("nullableRole")]
    public UserRole? NullableRole { get; set; }

    [JsonPropertyName("optionalRole")]
    public UserRole? OptionalRole { get; set; }

    [JsonPropertyName("optionalNullableRole")]
    public UserRole? OptionalNullableRole { get; set; }

    [JsonPropertyName("nullableStatus")]
    public UserStatus? NullableStatus { get; set; }

    [JsonPropertyName("optionalStatus")]
    public UserStatus? OptionalStatus { get; set; }

    [JsonPropertyName("optionalNullableStatus")]
    public UserStatus? OptionalNullableStatus { get; set; }

    [JsonPropertyName("nullableNotification")]
    public NotificationMethod? NullableNotification { get; set; }

    [JsonPropertyName("optionalNotification")]
    public NotificationMethod? OptionalNotification { get; set; }

    [JsonPropertyName("optionalNullableNotification")]
    public NotificationMethod? OptionalNullableNotification { get; set; }

    [JsonPropertyName("nullableSearchResult")]
    public SearchResult? NullableSearchResult { get; set; }

    [JsonPropertyName("optionalSearchResult")]
    public SearchResult? OptionalSearchResult { get; set; }

    [JsonPropertyName("nullableArray")]
    public IEnumerable<string>? NullableArray { get; set; }

    [JsonPropertyName("optionalArray")]
    public IEnumerable<string>? OptionalArray { get; set; }

    [JsonPropertyName("optionalNullableArray")]
    public IEnumerable<string>? OptionalNullableArray { get; set; }

    [JsonPropertyName("nullableListOfNullables")]
    public IEnumerable<string?>? NullableListOfNullables { get; set; }

    [JsonPropertyName("nullableMapOfNullables")]
    public Dictionary<string, Address?>? NullableMapOfNullables { get; set; }

    [JsonPropertyName("nullableListOfUnions")]
    public IEnumerable<NotificationMethod>? NullableListOfUnions { get; set; }

    [JsonPropertyName("optionalMapOfEnums")]
    public Dictionary<string, UserRole>? OptionalMapOfEnums { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<ComplexProfile>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(ComplexProfile).IsAssignableFrom(typeToConvert);

        public override ComplexProfile? Read(
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
            UserRole? _nullableRole = default;
            UserRole? _optionalRole = default;
            UserRole? _optionalNullableRole = default;
            UserStatus? _nullableStatus = default;
            UserStatus? _optionalStatus = default;
            UserStatus? _optionalNullableStatus = default;
            NotificationMethod? _nullableNotification = default;
            NotificationMethod? _optionalNotification = default;
            NotificationMethod? _optionalNullableNotification = default;
            SearchResult? _nullableSearchResult = default;
            SearchResult? _optionalSearchResult = default;
            IEnumerable<string>? _nullableArray = default;
            IEnumerable<string>? _optionalArray = default;
            IEnumerable<string>? _optionalNullableArray = default;
            IEnumerable<string?>? _nullableListOfNullables = default;
            Dictionary<string, Address?>? _nullableMapOfNullables = default;
            IEnumerable<NotificationMethod>? _nullableListOfUnions = default;
            Dictionary<string, UserRole>? _optionalMapOfEnums = default;
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
                    case "nullableRole":
                        _nullableRole = JsonSerializer.Deserialize<UserRole?>(ref reader, options);
                        break;
                    case "optionalRole":
                        _optionalRole = JsonSerializer.Deserialize<UserRole?>(ref reader, options);
                        break;
                    case "optionalNullableRole":
                        _optionalNullableRole = JsonSerializer.Deserialize<UserRole?>(
                            ref reader,
                            options
                        );
                        break;
                    case "nullableStatus":
                        _nullableStatus = JsonSerializer.Deserialize<UserStatus?>(
                            ref reader,
                            options
                        );
                        break;
                    case "optionalStatus":
                        _optionalStatus = JsonSerializer.Deserialize<UserStatus?>(
                            ref reader,
                            options
                        );
                        break;
                    case "optionalNullableStatus":
                        _optionalNullableStatus = JsonSerializer.Deserialize<UserStatus?>(
                            ref reader,
                            options
                        );
                        break;
                    case "nullableNotification":
                        _nullableNotification = JsonSerializer.Deserialize<NotificationMethod?>(
                            ref reader,
                            options
                        );
                        break;
                    case "optionalNotification":
                        _optionalNotification = JsonSerializer.Deserialize<NotificationMethod?>(
                            ref reader,
                            options
                        );
                        break;
                    case "optionalNullableNotification":
                        _optionalNullableNotification =
                            JsonSerializer.Deserialize<NotificationMethod?>(ref reader, options);
                        break;
                    case "nullableSearchResult":
                        _nullableSearchResult = JsonSerializer.Deserialize<SearchResult?>(
                            ref reader,
                            options
                        );
                        break;
                    case "optionalSearchResult":
                        _optionalSearchResult = JsonSerializer.Deserialize<SearchResult?>(
                            ref reader,
                            options
                        );
                        break;
                    case "nullableArray":
                        _nullableArray = JsonSerializer.Deserialize<IEnumerable<string>?>(
                            ref reader,
                            options
                        );
                        break;
                    case "optionalArray":
                        _optionalArray = JsonSerializer.Deserialize<IEnumerable<string>?>(
                            ref reader,
                            options
                        );
                        break;
                    case "optionalNullableArray":
                        _optionalNullableArray = JsonSerializer.Deserialize<IEnumerable<string>?>(
                            ref reader,
                            options
                        );
                        break;
                    case "nullableListOfNullables":
                        _nullableListOfNullables =
                            JsonSerializer.Deserialize<IEnumerable<string?>?>(ref reader, options);
                        break;
                    case "nullableMapOfNullables":
                        _nullableMapOfNullables = JsonSerializer.Deserialize<Dictionary<
                            string,
                            Address?
                        >?>(ref reader, options);
                        break;
                    case "nullableListOfUnions":
                        _nullableListOfUnions =
                            JsonSerializer.Deserialize<IEnumerable<NotificationMethod>?>(
                                ref reader,
                                options
                            );
                        break;
                    case "optionalMapOfEnums":
                        _optionalMapOfEnums = JsonSerializer.Deserialize<Dictionary<
                            string,
                            UserRole
                        >?>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new ComplexProfile
            {
                Id = _id,
                NullableRole = _nullableRole,
                OptionalRole = _optionalRole,
                OptionalNullableRole = _optionalNullableRole,
                NullableStatus = _nullableStatus,
                OptionalStatus = _optionalStatus,
                OptionalNullableStatus = _optionalNullableStatus,
                NullableNotification = _nullableNotification,
                OptionalNotification = _optionalNotification,
                OptionalNullableNotification = _optionalNullableNotification,
                NullableSearchResult = _nullableSearchResult,
                OptionalSearchResult = _optionalSearchResult,
                NullableArray = _nullableArray,
                OptionalArray = _optionalArray,
                OptionalNullableArray = _optionalNullableArray,
                NullableListOfNullables = _nullableListOfNullables,
                NullableMapOfNullables = _nullableMapOfNullables,
                NullableListOfUnions = _nullableListOfUnions,
                OptionalMapOfEnums = _optionalMapOfEnums,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            ComplexProfile value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("id");
            JsonSerializer.Serialize(writer, value.Id, options);
            if (value.NullableRole != null)
            {
                writer.WritePropertyName("nullableRole");
                JsonSerializer.Serialize(writer, value.NullableRole, options);
            }
            if (value.OptionalRole != null)
            {
                writer.WritePropertyName("optionalRole");
                JsonSerializer.Serialize(writer, value.OptionalRole, options);
            }
            if (value.OptionalNullableRole != null)
            {
                writer.WritePropertyName("optionalNullableRole");
                JsonSerializer.Serialize(writer, value.OptionalNullableRole, options);
            }
            if (value.NullableStatus != null)
            {
                writer.WritePropertyName("nullableStatus");
                JsonSerializer.Serialize(writer, value.NullableStatus, options);
            }
            if (value.OptionalStatus != null)
            {
                writer.WritePropertyName("optionalStatus");
                JsonSerializer.Serialize(writer, value.OptionalStatus, options);
            }
            if (value.OptionalNullableStatus != null)
            {
                writer.WritePropertyName("optionalNullableStatus");
                JsonSerializer.Serialize(writer, value.OptionalNullableStatus, options);
            }
            if (value.NullableNotification != null)
            {
                writer.WritePropertyName("nullableNotification");
                JsonSerializer.Serialize(writer, value.NullableNotification, options);
            }
            if (value.OptionalNotification != null)
            {
                writer.WritePropertyName("optionalNotification");
                JsonSerializer.Serialize(writer, value.OptionalNotification, options);
            }
            if (value.OptionalNullableNotification != null)
            {
                writer.WritePropertyName("optionalNullableNotification");
                JsonSerializer.Serialize(writer, value.OptionalNullableNotification, options);
            }
            if (value.NullableSearchResult != null)
            {
                writer.WritePropertyName("nullableSearchResult");
                JsonSerializer.Serialize(writer, value.NullableSearchResult, options);
            }
            if (value.OptionalSearchResult != null)
            {
                writer.WritePropertyName("optionalSearchResult");
                JsonSerializer.Serialize(writer, value.OptionalSearchResult, options);
            }
            if (value.NullableArray != null)
            {
                writer.WritePropertyName("nullableArray");
                JsonSerializer.Serialize(writer, value.NullableArray, options);
            }
            if (value.OptionalArray != null)
            {
                writer.WritePropertyName("optionalArray");
                JsonSerializer.Serialize(writer, value.OptionalArray, options);
            }
            if (value.OptionalNullableArray != null)
            {
                writer.WritePropertyName("optionalNullableArray");
                JsonSerializer.Serialize(writer, value.OptionalNullableArray, options);
            }
            if (value.NullableListOfNullables != null)
            {
                writer.WritePropertyName("nullableListOfNullables");
                JsonSerializer.Serialize(writer, value.NullableListOfNullables, options);
            }
            if (value.NullableMapOfNullables != null)
            {
                writer.WritePropertyName("nullableMapOfNullables");
                JsonSerializer.Serialize(writer, value.NullableMapOfNullables, options);
            }
            if (value.NullableListOfUnions != null)
            {
                writer.WritePropertyName("nullableListOfUnions");
                JsonSerializer.Serialize(writer, value.NullableListOfUnions, options);
            }
            if (value.OptionalMapOfEnums != null)
            {
                writer.WritePropertyName("optionalMapOfEnums");
                JsonSerializer.Serialize(writer, value.OptionalMapOfEnums, options);
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

        public override ComplexProfile ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<ComplexProfile>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            ComplexProfile value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
