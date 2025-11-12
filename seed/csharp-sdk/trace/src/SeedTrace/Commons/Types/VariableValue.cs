// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(VariableValue.JsonConverter))]
[Serializable]
public record VariableValue
{
    internal VariableValue(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of VariableValue with <see cref="VariableValue.IntegerValue"/>.
    /// </summary>
    public VariableValue(VariableValue.IntegerValue value)
    {
        Type = "integerValue";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of VariableValue with <see cref="VariableValue.BooleanValue"/>.
    /// </summary>
    public VariableValue(VariableValue.BooleanValue value)
    {
        Type = "booleanValue";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of VariableValue with <see cref="VariableValue.DoubleValue"/>.
    /// </summary>
    public VariableValue(VariableValue.DoubleValue value)
    {
        Type = "doubleValue";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of VariableValue with <see cref="VariableValue.StringValue"/>.
    /// </summary>
    public VariableValue(VariableValue.StringValue value)
    {
        Type = "stringValue";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of VariableValue with <see cref="VariableValue.CharValue"/>.
    /// </summary>
    public VariableValue(VariableValue.CharValue value)
    {
        Type = "charValue";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of VariableValue with <see cref="VariableValue.MapValue"/>.
    /// </summary>
    public VariableValue(VariableValue.MapValue value)
    {
        Type = "mapValue";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of VariableValue with <see cref="VariableValue.ListValue"/>.
    /// </summary>
    public VariableValue(VariableValue.ListValue value)
    {
        Type = "listValue";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of VariableValue with <see cref="VariableValue.BinaryTreeValue"/>.
    /// </summary>
    public VariableValue(VariableValue.BinaryTreeValue value)
    {
        Type = "binaryTreeValue";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of VariableValue with <see cref="VariableValue.SinglyLinkedListValue"/>.
    /// </summary>
    public VariableValue(VariableValue.SinglyLinkedListValue value)
    {
        Type = "singlyLinkedListValue";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of VariableValue with <see cref="VariableValue.DoublyLinkedListValue"/>.
    /// </summary>
    public VariableValue(VariableValue.DoublyLinkedListValue value)
    {
        Type = "doublyLinkedListValue";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of VariableValue with <see cref="VariableValue.NullValue"/>.
    /// </summary>
    public VariableValue(VariableValue.NullValue value)
    {
        Type = "nullValue";
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
    /// Returns true if <see cref="Type"/> is "integerValue"
    /// </summary>
    public bool IsIntegerValue => Type == "integerValue";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "booleanValue"
    /// </summary>
    public bool IsBooleanValue => Type == "booleanValue";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "doubleValue"
    /// </summary>
    public bool IsDoubleValue => Type == "doubleValue";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "stringValue"
    /// </summary>
    public bool IsStringValue => Type == "stringValue";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "charValue"
    /// </summary>
    public bool IsCharValue => Type == "charValue";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "mapValue"
    /// </summary>
    public bool IsMapValue => Type == "mapValue";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "listValue"
    /// </summary>
    public bool IsListValue => Type == "listValue";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "binaryTreeValue"
    /// </summary>
    public bool IsBinaryTreeValue => Type == "binaryTreeValue";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "singlyLinkedListValue"
    /// </summary>
    public bool IsSinglyLinkedListValue => Type == "singlyLinkedListValue";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "doublyLinkedListValue"
    /// </summary>
    public bool IsDoublyLinkedListValue => Type == "doublyLinkedListValue";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "nullValue"
    /// </summary>
    public bool IsNullValue => Type == "nullValue";

    /// <summary>
    /// Returns the value as a <see cref="int"/> if <see cref="Type"/> is 'integerValue', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'integerValue'.</exception>
    public int AsIntegerValue() =>
        IsIntegerValue
            ? (int)Value!
            : throw new System.Exception("VariableValue.Type is not 'integerValue'");

    /// <summary>
    /// Returns the value as a <see cref="bool"/> if <see cref="Type"/> is 'booleanValue', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'booleanValue'.</exception>
    public bool AsBooleanValue() =>
        IsBooleanValue
            ? (bool)Value!
            : throw new System.Exception("VariableValue.Type is not 'booleanValue'");

    /// <summary>
    /// Returns the value as a <see cref="double"/> if <see cref="Type"/> is 'doubleValue', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'doubleValue'.</exception>
    public double AsDoubleValue() =>
        IsDoubleValue
            ? (double)Value!
            : throw new System.Exception("VariableValue.Type is not 'doubleValue'");

    /// <summary>
    /// Returns the value as a <see cref="string"/> if <see cref="Type"/> is 'stringValue', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'stringValue'.</exception>
    public string AsStringValue() =>
        IsStringValue
            ? (string)Value!
            : throw new System.Exception("VariableValue.Type is not 'stringValue'");

    /// <summary>
    /// Returns the value as a <see cref="string"/> if <see cref="Type"/> is 'charValue', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'charValue'.</exception>
    public string AsCharValue() =>
        IsCharValue
            ? (string)Value!
            : throw new System.Exception("VariableValue.Type is not 'charValue'");

    /// <summary>
    /// Returns the value as a <see cref="SeedTrace.MapValue"/> if <see cref="Type"/> is 'mapValue', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'mapValue'.</exception>
    public SeedTrace.MapValue AsMapValue() =>
        IsMapValue
            ? (SeedTrace.MapValue)Value!
            : throw new System.Exception("VariableValue.Type is not 'mapValue'");

    /// <summary>
    /// Returns the value as a <see cref="IEnumerable<VariableValue>"/> if <see cref="Type"/> is 'listValue', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'listValue'.</exception>
    public IEnumerable<VariableValue> AsListValue() =>
        IsListValue
            ? (IEnumerable<VariableValue>)Value!
            : throw new System.Exception("VariableValue.Type is not 'listValue'");

    /// <summary>
    /// Returns the value as a <see cref="SeedTrace.BinaryTreeValue"/> if <see cref="Type"/> is 'binaryTreeValue', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'binaryTreeValue'.</exception>
    public SeedTrace.BinaryTreeValue AsBinaryTreeValue() =>
        IsBinaryTreeValue
            ? (SeedTrace.BinaryTreeValue)Value!
            : throw new System.Exception("VariableValue.Type is not 'binaryTreeValue'");

    /// <summary>
    /// Returns the value as a <see cref="SeedTrace.SinglyLinkedListValue"/> if <see cref="Type"/> is 'singlyLinkedListValue', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'singlyLinkedListValue'.</exception>
    public SeedTrace.SinglyLinkedListValue AsSinglyLinkedListValue() =>
        IsSinglyLinkedListValue
            ? (SeedTrace.SinglyLinkedListValue)Value!
            : throw new System.Exception("VariableValue.Type is not 'singlyLinkedListValue'");

    /// <summary>
    /// Returns the value as a <see cref="SeedTrace.DoublyLinkedListValue"/> if <see cref="Type"/> is 'doublyLinkedListValue', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'doublyLinkedListValue'.</exception>
    public SeedTrace.DoublyLinkedListValue AsDoublyLinkedListValue() =>
        IsDoublyLinkedListValue
            ? (SeedTrace.DoublyLinkedListValue)Value!
            : throw new System.Exception("VariableValue.Type is not 'doublyLinkedListValue'");

    /// <summary>
    /// Returns the value as a <see cref="object"/> if <see cref="Type"/> is 'nullValue', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'nullValue'.</exception>
    public object AsNullValue() =>
        IsNullValue ? Value! : throw new System.Exception("VariableValue.Type is not 'nullValue'");

    public T Match<T>(
        Func<int, T> onIntegerValue,
        Func<bool, T> onBooleanValue,
        Func<double, T> onDoubleValue,
        Func<string, T> onStringValue,
        Func<string, T> onCharValue,
        Func<SeedTrace.MapValue, T> onMapValue,
        Func<IEnumerable<VariableValue>, T> onListValue,
        Func<SeedTrace.BinaryTreeValue, T> onBinaryTreeValue,
        Func<SeedTrace.SinglyLinkedListValue, T> onSinglyLinkedListValue,
        Func<SeedTrace.DoublyLinkedListValue, T> onDoublyLinkedListValue,
        Func<object, T> onNullValue,
        Func<string, object?, T> onUnknown_
    )
    {
        return Type switch
        {
            "integerValue" => onIntegerValue(AsIntegerValue()),
            "booleanValue" => onBooleanValue(AsBooleanValue()),
            "doubleValue" => onDoubleValue(AsDoubleValue()),
            "stringValue" => onStringValue(AsStringValue()),
            "charValue" => onCharValue(AsCharValue()),
            "mapValue" => onMapValue(AsMapValue()),
            "listValue" => onListValue(AsListValue()),
            "binaryTreeValue" => onBinaryTreeValue(AsBinaryTreeValue()),
            "singlyLinkedListValue" => onSinglyLinkedListValue(AsSinglyLinkedListValue()),
            "doublyLinkedListValue" => onDoublyLinkedListValue(AsDoublyLinkedListValue()),
            "nullValue" => onNullValue(AsNullValue()),
            _ => onUnknown_(Type, Value),
        };
    }

    public void Visit(
        Action<int> onIntegerValue,
        Action<bool> onBooleanValue,
        Action<double> onDoubleValue,
        Action<string> onStringValue,
        Action<string> onCharValue,
        Action<SeedTrace.MapValue> onMapValue,
        Action<IEnumerable<VariableValue>> onListValue,
        Action<SeedTrace.BinaryTreeValue> onBinaryTreeValue,
        Action<SeedTrace.SinglyLinkedListValue> onSinglyLinkedListValue,
        Action<SeedTrace.DoublyLinkedListValue> onDoublyLinkedListValue,
        Action<object> onNullValue,
        Action<string, object?> onUnknown_
    )
    {
        switch (Type)
        {
            case "integerValue":
                onIntegerValue(AsIntegerValue());
                break;
            case "booleanValue":
                onBooleanValue(AsBooleanValue());
                break;
            case "doubleValue":
                onDoubleValue(AsDoubleValue());
                break;
            case "stringValue":
                onStringValue(AsStringValue());
                break;
            case "charValue":
                onCharValue(AsCharValue());
                break;
            case "mapValue":
                onMapValue(AsMapValue());
                break;
            case "listValue":
                onListValue(AsListValue());
                break;
            case "binaryTreeValue":
                onBinaryTreeValue(AsBinaryTreeValue());
                break;
            case "singlyLinkedListValue":
                onSinglyLinkedListValue(AsSinglyLinkedListValue());
                break;
            case "doublyLinkedListValue":
                onDoublyLinkedListValue(AsDoublyLinkedListValue());
                break;
            case "nullValue":
                onNullValue(AsNullValue());
                break;
            default:
                onUnknown_(Type, Value);
                break;
        }
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="int"/> and returns true if successful.
    /// </summary>
    public bool TryAsIntegerValue(out int? value)
    {
        if (Type == "integerValue")
        {
            value = (int)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="bool"/> and returns true if successful.
    /// </summary>
    public bool TryAsBooleanValue(out bool? value)
    {
        if (Type == "booleanValue")
        {
            value = (bool)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="double"/> and returns true if successful.
    /// </summary>
    public bool TryAsDoubleValue(out double? value)
    {
        if (Type == "doubleValue")
        {
            value = (double)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="string"/> and returns true if successful.
    /// </summary>
    public bool TryAsStringValue(out string? value)
    {
        if (Type == "stringValue")
        {
            value = (string)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="string"/> and returns true if successful.
    /// </summary>
    public bool TryAsCharValue(out string? value)
    {
        if (Type == "charValue")
        {
            value = (string)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedTrace.MapValue"/> and returns true if successful.
    /// </summary>
    public bool TryAsMapValue(out SeedTrace.MapValue? value)
    {
        if (Type == "mapValue")
        {
            value = (SeedTrace.MapValue)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="IEnumerable<VariableValue>"/> and returns true if successful.
    /// </summary>
    public bool TryAsListValue(out IEnumerable<VariableValue>? value)
    {
        if (Type == "listValue")
        {
            value = (IEnumerable<VariableValue>)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedTrace.BinaryTreeValue"/> and returns true if successful.
    /// </summary>
    public bool TryAsBinaryTreeValue(out SeedTrace.BinaryTreeValue? value)
    {
        if (Type == "binaryTreeValue")
        {
            value = (SeedTrace.BinaryTreeValue)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedTrace.SinglyLinkedListValue"/> and returns true if successful.
    /// </summary>
    public bool TryAsSinglyLinkedListValue(out SeedTrace.SinglyLinkedListValue? value)
    {
        if (Type == "singlyLinkedListValue")
        {
            value = (SeedTrace.SinglyLinkedListValue)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedTrace.DoublyLinkedListValue"/> and returns true if successful.
    /// </summary>
    public bool TryAsDoublyLinkedListValue(out SeedTrace.DoublyLinkedListValue? value)
    {
        if (Type == "doublyLinkedListValue")
        {
            value = (SeedTrace.DoublyLinkedListValue)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="object"/> and returns true if successful.
    /// </summary>
    public bool TryAsNullValue(out object? value)
    {
        if (Type == "nullValue")
        {
            value = Value!;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator VariableValue(VariableValue.IntegerValue value) => new(value);

    public static implicit operator VariableValue(VariableValue.BooleanValue value) => new(value);

    public static implicit operator VariableValue(VariableValue.DoubleValue value) => new(value);

    public static implicit operator VariableValue(VariableValue.StringValue value) => new(value);

    public static implicit operator VariableValue(VariableValue.CharValue value) => new(value);

    public static implicit operator VariableValue(VariableValue.MapValue value) => new(value);

    public static implicit operator VariableValue(VariableValue.ListValue value) => new(value);

    public static implicit operator VariableValue(VariableValue.BinaryTreeValue value) =>
        new(value);

    public static implicit operator VariableValue(VariableValue.SinglyLinkedListValue value) =>
        new(value);

    public static implicit operator VariableValue(VariableValue.DoublyLinkedListValue value) =>
        new(value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<VariableValue>
    {
        public override bool CanConvert(System.Type typeToConvert) =>
            typeof(VariableValue).IsAssignableFrom(typeToConvert);

        public override VariableValue Read(
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
                "integerValue" => json.GetProperty("value").Deserialize<int>(options),
                "booleanValue" => json.GetProperty("value").Deserialize<bool>(options),
                "doubleValue" => json.GetProperty("value").Deserialize<double>(options),
                "stringValue" => json.GetProperty("value").Deserialize<string?>(options)
                ?? throw new JsonException("Failed to deserialize string"),
                "charValue" => json.GetProperty("value").Deserialize<string?>(options)
                ?? throw new JsonException("Failed to deserialize string"),
                "mapValue" => json.Deserialize<SeedTrace.MapValue?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedTrace.MapValue"),
                "listValue" => json.GetProperty("value")
                    .Deserialize<IEnumerable<VariableValue>?>(options)
                ?? throw new JsonException("Failed to deserialize IEnumerable<VariableValue>"),
                "binaryTreeValue" => json.Deserialize<SeedTrace.BinaryTreeValue?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedTrace.BinaryTreeValue"),
                "singlyLinkedListValue" => json.Deserialize<SeedTrace.SinglyLinkedListValue?>(
                    options
                )
                    ?? throw new JsonException(
                        "Failed to deserialize SeedTrace.SinglyLinkedListValue"
                    ),
                "doublyLinkedListValue" => json.Deserialize<SeedTrace.DoublyLinkedListValue?>(
                    options
                )
                    ?? throw new JsonException(
                        "Failed to deserialize SeedTrace.DoublyLinkedListValue"
                    ),
                "nullValue" => new { },
                _ => json.Deserialize<object?>(options),
            };
            return new VariableValue(discriminator, value);
        }

        public override void Write(
            Utf8JsonWriter writer,
            VariableValue value,
            JsonSerializerOptions options
        )
        {
            JsonNode json =
                value.Type switch
                {
                    "integerValue" => new JsonObject
                    {
                        ["value"] = JsonSerializer.SerializeToNode(value.Value, options),
                    },
                    "booleanValue" => new JsonObject
                    {
                        ["value"] = JsonSerializer.SerializeToNode(value.Value, options),
                    },
                    "doubleValue" => new JsonObject
                    {
                        ["value"] = JsonSerializer.SerializeToNode(value.Value, options),
                    },
                    "stringValue" => new JsonObject
                    {
                        ["value"] = JsonSerializer.SerializeToNode(value.Value, options),
                    },
                    "charValue" => new JsonObject
                    {
                        ["value"] = JsonSerializer.SerializeToNode(value.Value, options),
                    },
                    "mapValue" => JsonSerializer.SerializeToNode(value.Value, options),
                    "listValue" => new JsonObject
                    {
                        ["value"] = JsonSerializer.SerializeToNode(value.Value, options),
                    },
                    "binaryTreeValue" => JsonSerializer.SerializeToNode(value.Value, options),
                    "singlyLinkedListValue" => JsonSerializer.SerializeToNode(value.Value, options),
                    "doublyLinkedListValue" => JsonSerializer.SerializeToNode(value.Value, options),
                    "nullValue" => null,
                    _ => JsonSerializer.SerializeToNode(value.Value, options),
                } ?? new JsonObject();
            json["type"] = value.Type;
            json.WriteTo(writer, options);
        }
    }

    /// <summary>
    /// Discriminated union type for integerValue
    /// </summary>
    [Serializable]
    public struct IntegerValue
    {
        public IntegerValue(int value)
        {
            Value = value;
        }

        internal int Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator VariableValue.IntegerValue(int value) => new(value);
    }

    /// <summary>
    /// Discriminated union type for booleanValue
    /// </summary>
    [Serializable]
    public struct BooleanValue
    {
        public BooleanValue(bool value)
        {
            Value = value;
        }

        internal bool Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator VariableValue.BooleanValue(bool value) => new(value);
    }

    /// <summary>
    /// Discriminated union type for doubleValue
    /// </summary>
    [Serializable]
    public struct DoubleValue
    {
        public DoubleValue(double value)
        {
            Value = value;
        }

        internal double Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator VariableValue.DoubleValue(double value) => new(value);
    }

    /// <summary>
    /// Discriminated union type for stringValue
    /// </summary>
    [Serializable]
    public record StringValue
    {
        public StringValue(string value)
        {
            Value = value;
        }

        internal string Value { get; set; }

        public override string ToString() => Value;

        public static implicit operator VariableValue.StringValue(string value) => new(value);
    }

    /// <summary>
    /// Discriminated union type for charValue
    /// </summary>
    [Serializable]
    public record CharValue
    {
        public CharValue(string value)
        {
            Value = value;
        }

        internal string Value { get; set; }

        public override string ToString() => Value;

        public static implicit operator VariableValue.CharValue(string value) => new(value);
    }

    /// <summary>
    /// Discriminated union type for mapValue
    /// </summary>
    [Serializable]
    public struct MapValue
    {
        public MapValue(SeedTrace.MapValue value)
        {
            Value = value;
        }

        internal SeedTrace.MapValue Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator VariableValue.MapValue(SeedTrace.MapValue value) =>
            new(value);
    }

    /// <summary>
    /// Discriminated union type for listValue
    /// </summary>
    [Serializable]
    public record ListValue
    {
        public ListValue(IEnumerable<VariableValue> value)
        {
            Value = value;
        }

        internal IEnumerable<VariableValue> Value { get; set; } = new List<VariableValue>();

        public override string ToString() => Value.ToString() ?? "null";
    }

    /// <summary>
    /// Discriminated union type for binaryTreeValue
    /// </summary>
    [Serializable]
    public struct BinaryTreeValue
    {
        public BinaryTreeValue(SeedTrace.BinaryTreeValue value)
        {
            Value = value;
        }

        internal SeedTrace.BinaryTreeValue Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator VariableValue.BinaryTreeValue(
            SeedTrace.BinaryTreeValue value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for singlyLinkedListValue
    /// </summary>
    [Serializable]
    public struct SinglyLinkedListValue
    {
        public SinglyLinkedListValue(SeedTrace.SinglyLinkedListValue value)
        {
            Value = value;
        }

        internal SeedTrace.SinglyLinkedListValue Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator VariableValue.SinglyLinkedListValue(
            SeedTrace.SinglyLinkedListValue value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for doublyLinkedListValue
    /// </summary>
    [Serializable]
    public struct DoublyLinkedListValue
    {
        public DoublyLinkedListValue(SeedTrace.DoublyLinkedListValue value)
        {
            Value = value;
        }

        internal SeedTrace.DoublyLinkedListValue Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator VariableValue.DoublyLinkedListValue(
            SeedTrace.DoublyLinkedListValue value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for nullValue
    /// </summary>
    [Serializable]
    public record NullValue
    {
        internal object Value => new { };

        public override string ToString() => Value.ToString() ?? "null";
    }
}
