using System.Text.Json;
using System.Text.Json.Serialization;

namespace SeedLiteral;

[JsonConverter(typeof(NestedObjectWithLiteralsLiteral1Converter))]
public readonly struct NestedObjectWithLiteralsLiteral1
{
    public const string Value = "literal1";

    public static implicit operator string(NestedObjectWithLiteralsLiteral1 _) => Value;

    public override string ToString() => Value;

    public override int GetHashCode() => Value.GetHashCode(StringComparison.Ordinal);

    public override bool Equals(object? obj) => obj is NestedObjectWithLiteralsLiteral1;

    public static bool operator ==(
        NestedObjectWithLiteralsLiteral1 _,
        NestedObjectWithLiteralsLiteral1 __
    ) => true;

    public static bool operator !=(
        NestedObjectWithLiteralsLiteral1 _,
        NestedObjectWithLiteralsLiteral1 __
    ) => false;

    internal sealed class NestedObjectWithLiteralsLiteral1Converter
        : JsonConverter<NestedObjectWithLiteralsLiteral1>
    {
        public override NestedObjectWithLiteralsLiteral1 Read(
            ref Utf8JsonReader reader,
            Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var value = reader.GetString();
            if (value != NestedObjectWithLiteralsLiteral1.Value)
            {
                throw new JsonException(
                    $"Expected \"literal1\" for type discriminator but got \"{value}\"."
                );
            }
            return new NestedObjectWithLiteralsLiteral1();
        }

        public override void Write(
            Utf8JsonWriter writer,
            NestedObjectWithLiteralsLiteral1 value,
            JsonSerializerOptions options
        ) => writer.WriteStringValue(NestedObjectWithLiteralsLiteral1.Value);
    }
}
