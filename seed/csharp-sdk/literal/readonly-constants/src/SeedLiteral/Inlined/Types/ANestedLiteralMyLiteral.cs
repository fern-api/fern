using System.Text.Json;
using System.Text.Json.Serialization;

namespace SeedLiteral;

[JsonConverter(typeof(ANestedLiteralMyLiteralConverter))]
public readonly struct ANestedLiteralMyLiteral
{
    public const string Value = "How super cool";

    public static implicit operator string(ANestedLiteralMyLiteral _) => Value;

    public override string ToString() => Value;

    public override int GetHashCode() => Value.GetHashCode(StringComparison.Ordinal);

    public override bool Equals(object? obj) => obj is ANestedLiteralMyLiteral;

    public static bool operator ==(ANestedLiteralMyLiteral _, ANestedLiteralMyLiteral __) => true;

    public static bool operator !=(ANestedLiteralMyLiteral _, ANestedLiteralMyLiteral __) => false;

    internal sealed class ANestedLiteralMyLiteralConverter : JsonConverter<ANestedLiteralMyLiteral>
    {
        public override ANestedLiteralMyLiteral Read(
            ref Utf8JsonReader reader,
            Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var value = reader.GetString();
            if (value != ANestedLiteralMyLiteral.Value)
            {
                throw new JsonException(
                    "Expected \""
                        + ANestedLiteralMyLiteral.Value
                        + "\" for type discriminator but got \""
                        + value
                        + "\"."
                );
            }
            return new ANestedLiteralMyLiteral();
        }

        public override void Write(
            Utf8JsonWriter writer,
            ANestedLiteralMyLiteral value,
            JsonSerializerOptions options
        ) => writer.WriteStringValue(ANestedLiteralMyLiteral.Value);
    }
}
