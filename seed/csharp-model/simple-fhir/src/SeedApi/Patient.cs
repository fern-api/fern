using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using OneOf;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(Patient.JsonConverter))]
[Serializable]
public record Patient
{
    [JsonPropertyName("resource_type")]
    public string ResourceType { get; set; } = "Patient";

    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("scripts")]
    public IEnumerable<Script> Scripts { get; set; } = new List<Script>();

    [JsonPropertyName("id")]
    public required string Id { get; set; }

    [JsonPropertyName("related_resources")]
    public IEnumerable<
        OneOf<Account, Patient, Practitioner, Script>
    > RelatedResources { get; set; } = new List<OneOf<Account, Patient, Practitioner, Script>>();

    [JsonPropertyName("memo")]
    public required Memo Memo { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<Patient>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(Patient).IsAssignableFrom(typeToConvert);

        public override Patient? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string _resourceType = default;
            string _name = default;
            IEnumerable<Script> _scripts = default;
            string _id = default;
            IEnumerable<OneOf<Account, Patient, Practitioner, Script>> _relatedResources = default;
            Memo _memo = default;
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
                    case "resource_type":
                        _resourceType = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "name":
                        _name = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "scripts":
                        _scripts = JsonSerializer.Deserialize<IEnumerable<Script>>(
                            ref reader,
                            options
                        );
                        break;
                    case "id":
                        _id = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "related_resources":
                        _relatedResources = JsonSerializer.Deserialize<
                            IEnumerable<OneOf<Account, Patient, Practitioner, Script>>
                        >(ref reader, options);
                        break;
                    case "memo":
                        _memo = JsonSerializer.Deserialize<Memo>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new Patient
            {
                ResourceType = _resourceType,
                Name = _name,
                Scripts = _scripts,
                Id = _id,
                RelatedResources = _relatedResources,
                Memo = _memo,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            Patient value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("resource_type");
            JsonSerializer.Serialize(writer, value.ResourceType, options);
            writer.WritePropertyName("name");
            JsonSerializer.Serialize(writer, value.Name, options);
            writer.WritePropertyName("scripts");
            JsonSerializer.Serialize(writer, value.Scripts, options);
            writer.WritePropertyName("id");
            JsonSerializer.Serialize(writer, value.Id, options);
            writer.WritePropertyName("related_resources");
            JsonSerializer.Serialize(writer, value.RelatedResources, options);
            writer.WritePropertyName("memo");
            JsonSerializer.Serialize(writer, value.Memo, options);
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

        public override Patient ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<Patient>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            Patient value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
