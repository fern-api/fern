using System.Text.Json;
using System.Text.Json.Serialization;
using SeedExhaustive;
using SeedExhaustive.Core;

namespace SeedExhaustive.Types;

[Serializable]
public record ObjectWithDocs : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

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

    void IJsonOnDeserialized.OnDeserialized() =>
        AdditionalProperties.CopyFromExtensionData(_extensionData);

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
