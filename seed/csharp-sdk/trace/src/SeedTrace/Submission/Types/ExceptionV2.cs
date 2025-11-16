// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(ExceptionV2.JsonConverter))]
[Serializable]
public record ExceptionV2
{
    internal ExceptionV2(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of ExceptionV2 with <see cref="ExceptionV2.Generic"/>.
    /// </summary>
    public ExceptionV2(ExceptionV2.Generic value)
    {
        Type = "generic";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of ExceptionV2 with <see cref="ExceptionV2.Timeout"/>.
    /// </summary>
    public ExceptionV2(ExceptionV2.Timeout value)
    {
        Type = "timeout";
        Value = value.Value;
    }

    /// <summary>
    /// Discriminant value
    /// </summary>
    [JsonPropertyName("type")]
    public string Type { get; internal set; }

    /// <summary>
    /// Discriminated union value
    /// </summary>
    public object? Value { get; internal set; }

    /// <summary>
    /// Returns true if <see cref="Type"/> is "generic"
    /// </summary>
    public bool IsGeneric => Type == "generic";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "timeout"
    /// </summary>
    public bool IsTimeout => Type == "timeout";

    /// <summary>
    /// Returns the value as a <see cref="SeedTrace.ExceptionInfo"/> if <see cref="Type"/> is 'generic', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'generic'.</exception>
    public SeedTrace.ExceptionInfo AsGeneric() =>
        IsGeneric
            ? (SeedTrace.ExceptionInfo)Value!
            : throw new System.Exception("ExceptionV2.Type is not 'generic'");

    /// <summary>
    /// Returns the value as a <see cref="object"/> if <see cref="Type"/> is 'timeout', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'timeout'.</exception>
    public object AsTimeout() =>
        IsTimeout ? Value! : throw new System.Exception("ExceptionV2.Type is not 'timeout'");

    public T Match<T>(
        Func<SeedTrace.ExceptionInfo, T> onGeneric,
        Func<object, T> onTimeout,
        Func<string, object?, T> onUnknown_
    )
    {
        return Type switch
        {
            "generic" => onGeneric(AsGeneric()),
            "timeout" => onTimeout(AsTimeout()),
            _ => onUnknown_(Type, Value),
        };
    }

    public void Visit(
        Action<SeedTrace.ExceptionInfo> onGeneric,
        Action<object> onTimeout,
        Action<string, object?> onUnknown_
    )
    {
        switch (Type)
        {
            case "generic":
                onGeneric(AsGeneric());
                break;
            case "timeout":
                onTimeout(AsTimeout());
                break;
            default:
                onUnknown_(Type, Value);
                break;
        }
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedTrace.ExceptionInfo"/> and returns true if successful.
    /// </summary>
    public bool TryAsGeneric(out SeedTrace.ExceptionInfo? value)
    {
        if (Type == "generic")
        {
            value = (SeedTrace.ExceptionInfo)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="object"/> and returns true if successful.
    /// </summary>
    public bool TryAsTimeout(out object? value)
    {
        if (Type == "timeout")
        {
            value = Value!;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator ExceptionV2(ExceptionV2.Generic value) => new(value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<ExceptionV2>
    {
        public override bool CanConvert(System.Type typeToConvert) =>
            typeof(ExceptionV2).IsAssignableFrom(typeToConvert);

        public override ExceptionV2 Read(
            ref Utf8JsonReader reader,
            System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = JsonElement.ParseValue(ref reader);
            if (!json.TryGetProperty("type", out var discriminatorElement))
            {
                throw new JsonException("Missing discriminator property 'type'");
            }
            if (discriminatorElement.ValueKind != JsonValueKind.String)
            {
                if (discriminatorElement.ValueKind == JsonValueKind.Null)
                {
                    throw new JsonException("Discriminator property 'type' is null");
                }

                throw new JsonException(
                    $"Discriminator property 'type' is not a string, instead is {discriminatorElement.ToString()}"
                );
            }

            var discriminator =
                discriminatorElement.GetString()
                ?? throw new JsonException("Discriminator property 'type' is null");

            var value = discriminator switch
            {
                "generic" => json.Deserialize<SeedTrace.ExceptionInfo?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedTrace.ExceptionInfo"),
                "timeout" => new { },
                _ => json.Deserialize<object?>(options),
            };
            return new ExceptionV2(discriminator, value);
        }

        public override void Write(
            Utf8JsonWriter writer,
            ExceptionV2 value,
            JsonSerializerOptions options
        )
        {
            JsonNode json =
                value.Type switch
                {
                    "generic" => JsonSerializer.SerializeToNode(value.Value, options),
                    "timeout" => null,
                    _ => JsonSerializer.SerializeToNode(value.Value, options),
                } ?? new JsonObject();
            json["type"] = value.Type;
            json.WriteTo(writer, options);
        }
    }

    /// <summary>
    /// Discriminated union type for generic
    /// </summary>
    [Serializable]
    public struct Generic
    {
        public Generic(SeedTrace.ExceptionInfo value)
        {
            Value = value;
        }

        internal SeedTrace.ExceptionInfo Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator ExceptionV2.Generic(SeedTrace.ExceptionInfo value) =>
            new(value);
    }

    /// <summary>
    /// Discriminated union type for timeout
    /// </summary>
    [Serializable]
    public record Timeout
    {
        internal object Value => new { };

        public override string ToString() => Value.ToString() ?? "null";
    }
}
