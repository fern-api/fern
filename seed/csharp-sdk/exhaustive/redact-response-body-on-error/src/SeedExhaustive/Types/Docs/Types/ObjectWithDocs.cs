using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedExhaustive;
using SeedExhaustive.Core;

namespace SeedExhaustive.Types;

[JsonConverter(typeof(ObjectWithDocs.JsonConverter))]
[Serializable]
public record ObjectWithDocs
{
    /// <summary>
    /// Characters that could lead to broken generated SDKs:
    ///
    /// Markdown Escapes:
    /// - \_: Escaped underscore (e.g., FOO\_BAR)
    /// - \*: Escaped asterisk
    ///
    /// JSDoc (JavaScript/TypeScript):
    /// - @: Used for JSDoc tags
    /// - {: }: Used for type definitions
    /// - &lt;: &gt;: HTML tags
    /// - *: Can interfere with comment blocks
    /// - /**: JSDoc comment start
    /// - ** /: JSDoc comment end
    /// - &: HTML entities
    ///
    /// XMLDoc (C#):
    /// - &lt;: &gt;: XML tags
    /// - &: ': ": &lt;: &gt;: XML special characters
    /// - {: }: Used for interpolated strings
    /// - ///: Comment marker
    /// - /**: Block comment start
    /// - ** /: Block comment end
    ///
    /// XMLDoc (C#) (Example of actual XML tags):
    /// See <see href="https://example.com/docs">the docs</see> for more info.
    /// Use <c>getValue()</c> to retrieve the value.
    /// Note: when count &lt; 10 or count &gt; 100, special handling applies.
    ///
    /// Javadoc (Java):
    /// - @: Used for Javadoc tags
    /// - &lt;: &gt;: HTML tags
    /// - &: HTML entities
    /// - *: Can interfere with comment blocks
    /// - /**: Javadoc comment start
    /// - ** /: Javadoc comment end
    ///
    /// Doxygen (C++):
    /// - \: Used for Doxygen commands
    /// - @: Alternative command prefix
    /// - &lt;: &gt;: XML/HTML tags
    /// - &: HTML entities
    /// - /**: C-style comment start
    /// - ** /: C-style comment end
    ///
    /// RDoc (Ruby):
    /// - :: Used in symbol notation
    /// - =: Section markers
    /// - #: Comment marker
    /// - =begin: Block comment start
    /// - =end: Block comment end
    /// - @: Instance variable prefix
    /// - $: Global variable prefix
    /// - %: String literal delimiter
    /// - #{: String interpolation start
    /// - }: String interpolation end
    ///
    /// PHPDoc (PHP):
    /// - @: Used for PHPDoc tags
    /// - {: }: Used for type definitions
    /// - $: Variable prefix
    /// - /**: PHPDoc comment start
    /// - ** /: PHPDoc comment end
    /// - *: Can interfere with comment blocks
    /// - &: HTML entities
    /// </summary>
    [JsonPropertyName("string")]
    public required string String { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<ObjectWithDocs>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(ObjectWithDocs).IsAssignableFrom(typeToConvert);

        public override ObjectWithDocs? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string _string = default;
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
                    case "string":
                        _string = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new ObjectWithDocs
            {
                String = _string,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            ObjectWithDocs value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("string");
            JsonSerializer.Serialize(writer, value.String, options);
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

        public override ObjectWithDocs ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<ObjectWithDocs>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            ObjectWithDocs value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
