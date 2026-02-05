// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(ErrorInfo.JsonConverter))]
[Serializable]
public record ErrorInfo
{
    internal ErrorInfo(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of ErrorInfo with <see cref="ErrorInfo.CompileError"/>.
    /// </summary>
    public ErrorInfo(ErrorInfo.CompileError value)
    {
        Type = "compileError";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of ErrorInfo with <see cref="ErrorInfo.RuntimeError"/>.
    /// </summary>
    public ErrorInfo(ErrorInfo.RuntimeError value)
    {
        Type = "runtimeError";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of ErrorInfo with <see cref="ErrorInfo.InternalError"/>.
    /// </summary>
    public ErrorInfo(ErrorInfo.InternalError value)
    {
        Type = "internalError";
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
    /// Returns true if <see cref="Type"/> is "compileError"
    /// </summary>
    public bool IsCompileError => Type == "compileError";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "runtimeError"
    /// </summary>
    public bool IsRuntimeError => Type == "runtimeError";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "internalError"
    /// </summary>
    public bool IsInternalError => Type == "internalError";

    /// <summary>
    /// Returns the value as a <see cref="SeedTrace.CompileError"/> if <see cref="Type"/> is 'compileError', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'compileError'.</exception>
    public SeedTrace.CompileError AsCompileError() =>
        IsCompileError
            ? (SeedTrace.CompileError)Value!
            : throw new System.Exception("ErrorInfo.Type is not 'compileError'");

    /// <summary>
    /// Returns the value as a <see cref="SeedTrace.RuntimeError"/> if <see cref="Type"/> is 'runtimeError', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'runtimeError'.</exception>
    public SeedTrace.RuntimeError AsRuntimeError() =>
        IsRuntimeError
            ? (SeedTrace.RuntimeError)Value!
            : throw new System.Exception("ErrorInfo.Type is not 'runtimeError'");

    /// <summary>
    /// Returns the value as a <see cref="SeedTrace.InternalError"/> if <see cref="Type"/> is 'internalError', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'internalError'.</exception>
    public SeedTrace.InternalError AsInternalError() =>
        IsInternalError
            ? (SeedTrace.InternalError)Value!
            : throw new System.Exception("ErrorInfo.Type is not 'internalError'");

    public T Match<T>(
        Func<SeedTrace.CompileError, T> onCompileError,
        Func<SeedTrace.RuntimeError, T> onRuntimeError,
        Func<SeedTrace.InternalError, T> onInternalError,
        Func<string, object?, T> onUnknown_
    )
    {
        return Type switch
        {
            "compileError" => onCompileError(AsCompileError()),
            "runtimeError" => onRuntimeError(AsRuntimeError()),
            "internalError" => onInternalError(AsInternalError()),
            _ => onUnknown_(Type, Value),
        };
    }

    public void Visit(
        Action<SeedTrace.CompileError> onCompileError,
        Action<SeedTrace.RuntimeError> onRuntimeError,
        Action<SeedTrace.InternalError> onInternalError,
        Action<string, object?> onUnknown_
    )
    {
        switch (Type)
        {
            case "compileError":
                onCompileError(AsCompileError());
                break;
            case "runtimeError":
                onRuntimeError(AsRuntimeError());
                break;
            case "internalError":
                onInternalError(AsInternalError());
                break;
            default:
                onUnknown_(Type, Value);
                break;
        }
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedTrace.CompileError"/> and returns true if successful.
    /// </summary>
    public bool TryAsCompileError(out SeedTrace.CompileError? value)
    {
        if (Type == "compileError")
        {
            value = (SeedTrace.CompileError)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedTrace.RuntimeError"/> and returns true if successful.
    /// </summary>
    public bool TryAsRuntimeError(out SeedTrace.RuntimeError? value)
    {
        if (Type == "runtimeError")
        {
            value = (SeedTrace.RuntimeError)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedTrace.InternalError"/> and returns true if successful.
    /// </summary>
    public bool TryAsInternalError(out SeedTrace.InternalError? value)
    {
        if (Type == "internalError")
        {
            value = (SeedTrace.InternalError)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator ErrorInfo(ErrorInfo.CompileError value) => new(value);

    public static implicit operator ErrorInfo(ErrorInfo.RuntimeError value) => new(value);

    public static implicit operator ErrorInfo(ErrorInfo.InternalError value) => new(value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<ErrorInfo>
    {
        public override bool CanConvert(System.Type typeToConvert) =>
            typeof(ErrorInfo).IsAssignableFrom(typeToConvert);

        public override ErrorInfo Read(
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
                "compileError" => json.Deserialize<SeedTrace.CompileError?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedTrace.CompileError"),
                "runtimeError" => json.Deserialize<SeedTrace.RuntimeError?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedTrace.RuntimeError"),
                "internalError" => json.Deserialize<SeedTrace.InternalError?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedTrace.InternalError"),
                _ => json.Deserialize<object?>(options),
            };
            return new ErrorInfo(discriminator, value);
        }

        public override void Write(
            Utf8JsonWriter writer,
            ErrorInfo value,
            JsonSerializerOptions options
        )
        {
            JsonNode json =
                value.Type switch
                {
                    "compileError" => JsonSerializer.SerializeToNode(value.Value, options),
                    "runtimeError" => JsonSerializer.SerializeToNode(value.Value, options),
                    "internalError" => JsonSerializer.SerializeToNode(value.Value, options),
                    _ => JsonSerializer.SerializeToNode(value.Value, options),
                } ?? new JsonObject();
            json["type"] = value.Type;
            json.WriteTo(writer, options);
        }
    }

    /// <summary>
    /// Discriminated union type for compileError
    /// </summary>
    [Serializable]
    public struct CompileError
    {
        public CompileError(SeedTrace.CompileError value)
        {
            Value = value;
        }

        internal SeedTrace.CompileError Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator ErrorInfo.CompileError(SeedTrace.CompileError value) =>
            new(value);
    }

    /// <summary>
    /// Discriminated union type for runtimeError
    /// </summary>
    [Serializable]
    public struct RuntimeError
    {
        public RuntimeError(SeedTrace.RuntimeError value)
        {
            Value = value;
        }

        internal SeedTrace.RuntimeError Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator ErrorInfo.RuntimeError(SeedTrace.RuntimeError value) =>
            new(value);
    }

    /// <summary>
    /// Discriminated union type for internalError
    /// </summary>
    [Serializable]
    public struct InternalError
    {
        public InternalError(SeedTrace.InternalError value)
        {
            Value = value;
        }

        internal SeedTrace.InternalError Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator ErrorInfo.InternalError(SeedTrace.InternalError value) =>
            new(value);
    }
}
