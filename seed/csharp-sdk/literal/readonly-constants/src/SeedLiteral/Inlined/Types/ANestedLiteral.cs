using System.Text.Json;
using System.Text.Json.Serialization;
using SeedLiteral.Core;

namespace SeedLiteral;

[Serializable]
public record ANestedLiteral : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonRequired]
    [JsonPropertyName("myLiteral")]
    public ANestedLiteral.MyLiteralLiteral MyLiteral { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    } = new();

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    void IJsonOnDeserialized.OnDeserialized() =>
        AdditionalProperties.CopyFromExtensionData(_extensionData);

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [JsonConverter(typeof(MyLiteralLiteralConverter))]
    public readonly struct MyLiteralLiteral
    {
        public const string Value = "How super cool";

        public static implicit operator string(MyLiteralLiteral _) => Value;

        public override string ToString() => Value;

        public override int GetHashCode() =>
            Value.GetHashCode(global::System.StringComparison.Ordinal);

        public override bool Equals(object? obj) => obj is MyLiteralLiteral;

        public static bool operator ==(MyLiteralLiteral _, MyLiteralLiteral __) => true;

        public static bool operator !=(MyLiteralLiteral _, MyLiteralLiteral __) => false;

        internal sealed class MyLiteralLiteralConverter : JsonConverter<MyLiteralLiteral>
        {
            public override MyLiteralLiteral Read(
                ref Utf8JsonReader reader,
                global::System.Type typeToConvert,
                JsonSerializerOptions options
            )
            {
                var value = reader.GetString();
                if (value != MyLiteralLiteral.Value)
                {
                    throw new JsonException(
                        "Expected \""
                            + MyLiteralLiteral.Value
                            + "\" for type discriminator but got \""
                            + value
                            + "\"."
                    );
                }
                return new MyLiteralLiteral();
            }

            public override void Write(
                Utf8JsonWriter writer,
                MyLiteralLiteral value,
                JsonSerializerOptions options
            ) => writer.WriteStringValue(MyLiteralLiteral.Value);
        }
    }
}
