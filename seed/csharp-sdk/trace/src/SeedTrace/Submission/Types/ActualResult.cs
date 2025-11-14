// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(ActualResult.JsonConverter))]
[Serializable]
public record ActualResult
{
    internal ActualResult(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of ActualResult with <see cref="ActualResult.ValueInner"/>.
    /// </summary>
    public ActualResult(ActualResult.ValueInner value)
    {
        Type = "value";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of ActualResult with <see cref="ActualResult.Exception"/>.
    /// </summary>
    public ActualResult(ActualResult.Exception value)
    {
        Type = "exception";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of ActualResult with <see cref="ActualResult.ExceptionV2"/>.
    /// </summary>
    public ActualResult(ActualResult.ExceptionV2 value)
    {
        Type = "exceptionV2";
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
    /// Returns true if <see cref="Type"/> is "value"
    /// </summary>
    public bool IsValue => Type == "value";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "exception"
    /// </summary>
    public bool IsException => Type == "exception";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "exceptionV2"
    /// </summary>
    public bool IsExceptionV2 => Type == "exceptionV2";

    /// <summary>
    /// Returns the value as a <see cref="SeedTrace.VariableValue"/> if <see cref="Type"/> is 'value', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'value'.</exception>
    public SeedTrace.VariableValue AsValue() =>
        IsValue
            ? (SeedTrace.VariableValue)Value!
            : throw new System.Exception("ActualResult.Type is not 'value'");

    /// <summary>
    /// Returns the value as a <see cref="SeedTrace.ExceptionInfo"/> if <see cref="Type"/> is 'exception', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'exception'.</exception>
    public SeedTrace.ExceptionInfo AsException() =>
        IsException
            ? (SeedTrace.ExceptionInfo)Value!
            : throw new System.Exception("ActualResult.Type is not 'exception'");

    /// <summary>
    /// Returns the value as a <see cref="SeedTrace.ExceptionV2"/> if <see cref="Type"/> is 'exceptionV2', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'exceptionV2'.</exception>
    public SeedTrace.ExceptionV2 AsExceptionV2() =>
        IsExceptionV2
            ? (SeedTrace.ExceptionV2)Value!
            : throw new System.Exception("ActualResult.Type is not 'exceptionV2'");

    public T Match<T>(
        Func<SeedTrace.VariableValue, T> onValue,
        Func<SeedTrace.ExceptionInfo, T> onException,
        Func<SeedTrace.ExceptionV2, T> onExceptionV2,
        Func<string, object?, T> onUnknown_
    )
    {
        return Type switch
        {
            "value" => onValue(AsValue()),
            "exception" => onException(AsException()),
            "exceptionV2" => onExceptionV2(AsExceptionV2()),
            _ => onUnknown_(Type, Value),
        };
    }

    public void Visit(
        Action<SeedTrace.VariableValue> onValue,
        Action<SeedTrace.ExceptionInfo> onException,
        Action<SeedTrace.ExceptionV2> onExceptionV2,
        Action<string, object?> onUnknown_
    )
    {
        switch (Type)
        {
            case "value":
                onValue(AsValue());
                break;
            case "exception":
                onException(AsException());
                break;
            case "exceptionV2":
                onExceptionV2(AsExceptionV2());
                break;
            default:
                onUnknown_(Type, Value);
                break;
        }
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedTrace.VariableValue"/> and returns true if successful.
    /// </summary>
    public bool TryAsValue(out SeedTrace.VariableValue? value)
    {
        if (Type == "value")
        {
            value = (SeedTrace.VariableValue)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedTrace.ExceptionInfo"/> and returns true if successful.
    /// </summary>
    public bool TryAsException(out SeedTrace.ExceptionInfo? value)
    {
        if (Type == "exception")
        {
            value = (SeedTrace.ExceptionInfo)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedTrace.ExceptionV2"/> and returns true if successful.
    /// </summary>
    public bool TryAsExceptionV2(out SeedTrace.ExceptionV2? value)
    {
        if (Type == "exceptionV2")
        {
            value = (SeedTrace.ExceptionV2)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator ActualResult(ActualResult.ValueInner value) => new(value);

    public static implicit operator ActualResult(ActualResult.Exception value) => new(value);

    public static implicit operator ActualResult(ActualResult.ExceptionV2 value) => new(value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<ActualResult>
    {
        public override bool CanConvert(System.Type typeToConvert) =>
            typeof(ActualResult).IsAssignableFrom(typeToConvert);

        public override ActualResult Read(
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
                "value" => json.GetProperty("value").Deserialize<SeedTrace.VariableValue?>(options)
                ?? throw new JsonException("Failed to deserialize SeedTrace.VariableValue"),
                "exception" => json.Deserialize<SeedTrace.ExceptionInfo?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedTrace.ExceptionInfo"),
                "exceptionV2" => json.GetProperty("value")
                    .Deserialize<SeedTrace.ExceptionV2?>(options)
                ?? throw new JsonException("Failed to deserialize SeedTrace.ExceptionV2"),
                _ => json.Deserialize<object?>(options),
            };
            return new ActualResult(discriminator, value);
        }

        public override void Write(
            Utf8JsonWriter writer,
            ActualResult value,
            JsonSerializerOptions options
        )
        {
            JsonNode json =
                value.Type switch
                {
                    "value" => new JsonObject
                    {
                        ["value"] = JsonSerializer.SerializeToNode(value.Value, options),
                    },
                    "exception" => JsonSerializer.SerializeToNode(value.Value, options),
                    "exceptionV2" => new JsonObject
                    {
                        ["value"] = JsonSerializer.SerializeToNode(value.Value, options),
                    },
                    _ => JsonSerializer.SerializeToNode(value.Value, options),
                } ?? new JsonObject();
            json["type"] = value.Type;
            json.WriteTo(writer, options);
        }
    }

    /// <summary>
    /// Discriminated union type for value
    /// </summary>
    [Serializable]
    public struct ValueInner
    {
        public ValueInner(SeedTrace.VariableValue value)
        {
            Value = value;
        }

        internal SeedTrace.VariableValue Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator ActualResult.ValueInner(SeedTrace.VariableValue value) =>
            new(value);
    }

    /// <summary>
    /// Discriminated union type for exception
    /// </summary>
    [Serializable]
    public struct Exception
    {
        public Exception(SeedTrace.ExceptionInfo value)
        {
            Value = value;
        }

        internal SeedTrace.ExceptionInfo Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator ActualResult.Exception(SeedTrace.ExceptionInfo value) =>
            new(value);
    }

    /// <summary>
    /// Discriminated union type for exceptionV2
    /// </summary>
    [Serializable]
    public struct ExceptionV2
    {
        public ExceptionV2(SeedTrace.ExceptionV2 value)
        {
            Value = value;
        }

        internal SeedTrace.ExceptionV2 Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator ActualResult.ExceptionV2(SeedTrace.ExceptionV2 value) =>
            new(value);
    }
}
