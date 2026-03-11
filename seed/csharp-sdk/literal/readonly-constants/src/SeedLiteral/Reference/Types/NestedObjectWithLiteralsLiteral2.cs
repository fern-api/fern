using System.Text.Json;
using System.Text.Json.Serialization;

namespace SeedLiteral;

[JsonConverter(typeof(NestedObjectWithLiteralsLiteral2Converter))]
public readonly struct NestedObjectWithLiteralsLiteral2
{
    public const string Value = "literal2";

    public static implicit operator string(NestedObjectWithLiteralsLiteral2 _) => Value;

    public override string ToString() => Value;

    public override int GetHashCode() => Value.GetHashCode(StringComparison.Ordinal);

    public override bool Equals(object? obj) => obj is NestedObjectWithLiteralsLiteral2;

    public static bool operator ==(
        NestedObjectWithLiteralsLiteral2 _,
        NestedObjectWithLiteralsLiteral2 __
    ) => true;

    public static bool operator !=(
        NestedObjectWithLiteralsLiteral2 _,
        NestedObjectWithLiteralsLiteral2 __
    ) => false;

    internal sealed class NestedObjectWithLiteralsLiteral2Converter
        : JsonConverter<NestedObjectWithLiteralsLiteral2>
    {
        public override NestedObjectWithLiteralsLiteral2 Read(
            ref Utf8JsonReader reader,
            Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var value = reader.GetString();
            if (value != NestedObjectWithLiteralsLiteral2.Value)
            {
                throw new JsonException(
                    $"Expected \"literal2\" for type discriminator but got \"{value}\"."
                );
            }
            return new NestedObjectWithLiteralsLiteral2();
        }

        public override void Write(
            Utf8JsonWriter writer,
            NestedObjectWithLiteralsLiteral2 value,
            JsonSerializerOptions options
        ) => writer.WriteStringValue(NestedObjectWithLiteralsLiteral2.Value);
    }
}
