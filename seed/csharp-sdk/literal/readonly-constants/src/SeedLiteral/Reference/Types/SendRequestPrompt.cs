using System.Text.Json;
using System.Text.Json.Serialization;

namespace SeedLiteral;

[JsonConverter(typeof(SendRequestPromptConverter))]
public readonly struct SendRequestPrompt
{
    public const string Value = "You are a helpful assistant";

    public static implicit operator string(SendRequestPrompt _) => Value;

    public override string ToString() => Value;

    public override int GetHashCode() => Value.GetHashCode(StringComparison.Ordinal);

    public override bool Equals(object? obj) => obj is SendRequestPrompt;

    public static bool operator ==(SendRequestPrompt _, SendRequestPrompt __) => true;

    public static bool operator !=(SendRequestPrompt _, SendRequestPrompt __) => false;

    internal sealed class SendRequestPromptConverter : JsonConverter<SendRequestPrompt>
    {
        public override SendRequestPrompt Read(
            ref Utf8JsonReader reader,
            Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var value = reader.GetString();
            if (value != SendRequestPrompt.Value)
            {
                throw new JsonException(
                    $"Expected \"You are a helpful assistant\" for type discriminator but got \"{value}\"."
                );
            }
            return new SendRequestPrompt();
        }

        public override void Write(
            Utf8JsonWriter writer,
            SendRequestPrompt value,
            JsonSerializerOptions options
        ) => writer.WriteStringValue(SendRequestPrompt.Value);
    }
}
