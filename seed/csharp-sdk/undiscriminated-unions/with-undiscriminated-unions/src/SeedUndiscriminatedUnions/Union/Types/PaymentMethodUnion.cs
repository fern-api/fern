// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using System.Text.Json;
using System.Text.Json.Serialization;
using SeedUndiscriminatedUnions.Core;

namespace SeedUndiscriminatedUnions;

/// <summary>
/// Tests that nested properties with camelCase wire names are properly
/// converted from snake_case Ruby keys when passed as Hash values.
/// </summary>
[JsonConverter(typeof(PaymentMethodUnion.JsonConverter))]
[Serializable]
public class PaymentMethodUnion
{
    private PaymentMethodUnion(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Type discriminator
    /// </summary>
    [JsonIgnore]
    public string Type { get; internal set; }

    /// <summary>
    /// Union value
    /// </summary>
    [JsonIgnore]
    public object? Value { get; internal set; }

    /// <summary>
    /// Factory method to create a union from a SeedUndiscriminatedUnions.TokenizeCard value.
    /// </summary>
    public static PaymentMethodUnion FromTokenizeCard(
        SeedUndiscriminatedUnions.TokenizeCard value
    ) => new("tokenizeCard", value);

    /// <summary>
    /// Factory method to create a union from a SeedUndiscriminatedUnions.ConvertToken value.
    /// </summary>
    public static PaymentMethodUnion FromConvertToken(
        SeedUndiscriminatedUnions.ConvertToken value
    ) => new("convertToken", value);

    /// <summary>
    /// Returns true if <see cref="Type"/> is "tokenizeCard"
    /// </summary>
    public bool IsTokenizeCard() => Type == "tokenizeCard";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "convertToken"
    /// </summary>
    public bool IsConvertToken() => Type == "convertToken";

    /// <summary>
    /// Returns the value as a <see cref="SeedUndiscriminatedUnions.TokenizeCard"/> if <see cref="Type"/> is 'tokenizeCard', otherwise throws an exception.
    /// </summary>
    /// <exception cref="SeedUndiscriminatedUnionsException">Thrown when <see cref="Type"/> is not 'tokenizeCard'.</exception>
    public SeedUndiscriminatedUnions.TokenizeCard AsTokenizeCard() =>
        IsTokenizeCard()
            ? (SeedUndiscriminatedUnions.TokenizeCard)Value!
            : throw new SeedUndiscriminatedUnionsException("Union type is not 'tokenizeCard'");

    /// <summary>
    /// Returns the value as a <see cref="SeedUndiscriminatedUnions.ConvertToken"/> if <see cref="Type"/> is 'convertToken', otherwise throws an exception.
    /// </summary>
    /// <exception cref="SeedUndiscriminatedUnionsException">Thrown when <see cref="Type"/> is not 'convertToken'.</exception>
    public SeedUndiscriminatedUnions.ConvertToken AsConvertToken() =>
        IsConvertToken()
            ? (SeedUndiscriminatedUnions.ConvertToken)Value!
            : throw new SeedUndiscriminatedUnionsException("Union type is not 'convertToken'");

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedUndiscriminatedUnions.TokenizeCard"/> and returns true if successful.
    /// </summary>
    public bool TryGetTokenizeCard(out SeedUndiscriminatedUnions.TokenizeCard? value)
    {
        if (Type == "tokenizeCard")
        {
            value = (SeedUndiscriminatedUnions.TokenizeCard)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedUndiscriminatedUnions.ConvertToken"/> and returns true if successful.
    /// </summary>
    public bool TryGetConvertToken(out SeedUndiscriminatedUnions.ConvertToken? value)
    {
        if (Type == "convertToken")
        {
            value = (SeedUndiscriminatedUnions.ConvertToken)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public T Match<T>(
        Func<SeedUndiscriminatedUnions.TokenizeCard, T> onTokenizeCard,
        Func<SeedUndiscriminatedUnions.ConvertToken, T> onConvertToken
    )
    {
        return Type switch
        {
            "tokenizeCard" => onTokenizeCard(AsTokenizeCard()),
            "convertToken" => onConvertToken(AsConvertToken()),
            _ => throw new SeedUndiscriminatedUnionsException($"Unknown union type: {Type}"),
        };
    }

    public void Visit(
        Action<SeedUndiscriminatedUnions.TokenizeCard> onTokenizeCard,
        Action<SeedUndiscriminatedUnions.ConvertToken> onConvertToken
    )
    {
        switch (Type)
        {
            case "tokenizeCard":
                onTokenizeCard(AsTokenizeCard());
                break;
            case "convertToken":
                onConvertToken(AsConvertToken());
                break;
            default:
                throw new SeedUndiscriminatedUnionsException($"Unknown union type: {Type}");
        }
    }

    public override int GetHashCode()
    {
        unchecked
        {
            var hashCode = Type.GetHashCode();
            if (Value != null)
            {
                hashCode = (hashCode * 397) ^ Value.GetHashCode();
            }
            return hashCode;
        }
    }

    public override bool Equals(object? obj)
    {
        if (obj is null)
            return false;
        if (ReferenceEquals(this, obj))
            return true;
        if (obj is not PaymentMethodUnion other)
            return false;

        // Compare type discriminators
        if (Type != other.Type)
            return false;

        // Compare values using EqualityComparer for deep comparison
        return System.Collections.Generic.EqualityComparer<object?>.Default.Equals(
            Value,
            other.Value
        );
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator PaymentMethodUnion(
        SeedUndiscriminatedUnions.TokenizeCard value
    ) => new("tokenizeCard", value);

    public static implicit operator PaymentMethodUnion(
        SeedUndiscriminatedUnions.ConvertToken value
    ) => new("convertToken", value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<PaymentMethodUnion>
    {
        public override PaymentMethodUnion? Read(
            ref Utf8JsonReader reader,
            System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            if (reader.TokenType == JsonTokenType.StartObject)
            {
                var document = JsonDocument.ParseValue(ref reader);

                var types = new (string Key, System.Type Type)[]
                {
                    ("tokenizeCard", typeof(SeedUndiscriminatedUnions.TokenizeCard)),
                    ("convertToken", typeof(SeedUndiscriminatedUnions.ConvertToken)),
                };

                foreach (var (key, type) in types)
                {
                    try
                    {
                        var value = document.Deserialize(type, options);
                        if (value != null)
                        {
                            PaymentMethodUnion result = new(key, value);
                            return result;
                        }
                    }
                    catch (JsonException)
                    {
                        // Try next type;
                    }
                }
            }

            throw new JsonException(
                $"Cannot deserialize JSON token {reader.TokenType} into PaymentMethodUnion"
            );
        }

        public override void Write(
            Utf8JsonWriter writer,
            PaymentMethodUnion value,
            JsonSerializerOptions options
        )
        {
            if (value == null)
            {
                writer.WriteNullValue();
                return;
            }

            value.Visit(
                obj => JsonSerializer.Serialize(writer, obj, options),
                obj => JsonSerializer.Serialize(writer, obj, options)
            );
        }

        public override PaymentMethodUnion? ReadAsPropertyName(
            ref Utf8JsonReader reader,
            System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var stringValue = reader.GetString()!;
            PaymentMethodUnion result = new("string", stringValue);
            return result;
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            PaymentMethodUnion value,
            JsonSerializerOptions options
        )
        {
            writer.WritePropertyName(value.Value?.ToString() ?? "null");
        }
    }
}
