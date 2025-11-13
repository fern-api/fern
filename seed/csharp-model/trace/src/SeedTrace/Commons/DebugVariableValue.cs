// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(DebugVariableValue.JsonConverter))]
[Serializable]
public record DebugVariableValue
{
    internal DebugVariableValue(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of DebugVariableValue with <see cref="DebugVariableValue.IntegerValue"/>.
    /// </summary>
    public DebugVariableValue(DebugVariableValue.IntegerValue value)
    {
        Type = "integerValue";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of DebugVariableValue with <see cref="DebugVariableValue.BooleanValue"/>.
    /// </summary>
    public DebugVariableValue(DebugVariableValue.BooleanValue value)
    {
        Type = "booleanValue";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of DebugVariableValue with <see cref="DebugVariableValue.DoubleValue"/>.
    /// </summary>
    public DebugVariableValue(DebugVariableValue.DoubleValue value)
    {
        Type = "doubleValue";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of DebugVariableValue with <see cref="DebugVariableValue.StringValue"/>.
    /// </summary>
    public DebugVariableValue(DebugVariableValue.StringValue value)
    {
        Type = "stringValue";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of DebugVariableValue with <see cref="DebugVariableValue.CharValue"/>.
    /// </summary>
    public DebugVariableValue(DebugVariableValue.CharValue value)
    {
        Type = "charValue";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of DebugVariableValue with <see cref="DebugVariableValue.MapValue"/>.
    /// </summary>
    public DebugVariableValue(DebugVariableValue.MapValue value)
    {
        Type = "mapValue";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of DebugVariableValue with <see cref="DebugVariableValue.ListValue"/>.
    /// </summary>
    public DebugVariableValue(DebugVariableValue.ListValue value)
    {
        Type = "listValue";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of DebugVariableValue with <see cref="DebugVariableValue.BinaryTreeNodeValue"/>.
    /// </summary>
    public DebugVariableValue(DebugVariableValue.BinaryTreeNodeValue value)
    {
        Type = "binaryTreeNodeValue";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of DebugVariableValue with <see cref="DebugVariableValue.SinglyLinkedListNodeValue"/>.
    /// </summary>
    public DebugVariableValue(DebugVariableValue.SinglyLinkedListNodeValue value)
    {
        Type = "singlyLinkedListNodeValue";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of DebugVariableValue with <see cref="DebugVariableValue.DoublyLinkedListNodeValue"/>.
    /// </summary>
    public DebugVariableValue(DebugVariableValue.DoublyLinkedListNodeValue value)
    {
        Type = "doublyLinkedListNodeValue";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of DebugVariableValue with <see cref="DebugVariableValue.UndefinedValue"/>.
    /// </summary>
    public DebugVariableValue(DebugVariableValue.UndefinedValue value)
    {
        Type = "undefinedValue";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of DebugVariableValue with <see cref="DebugVariableValue.NullValue"/>.
    /// </summary>
    public DebugVariableValue(DebugVariableValue.NullValue value)
    {
        Type = "nullValue";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of DebugVariableValue with <see cref="DebugVariableValue.GenericValue"/>.
    /// </summary>
    public DebugVariableValue(DebugVariableValue.GenericValue value)
    {
        Type = "genericValue";
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
    /// Returns true if <see cref="Type"/> is "binaryTreeNodeValue"
    /// </summary>
    public bool IsBinaryTreeNodeValue => Type == "binaryTreeNodeValue";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "singlyLinkedListNodeValue"
    /// </summary>
    public bool IsSinglyLinkedListNodeValue => Type == "singlyLinkedListNodeValue";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "doublyLinkedListNodeValue"
    /// </summary>
    public bool IsDoublyLinkedListNodeValue => Type == "doublyLinkedListNodeValue";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "undefinedValue"
    /// </summary>
    public bool IsUndefinedValue => Type == "undefinedValue";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "nullValue"
    /// </summary>
    public bool IsNullValue => Type == "nullValue";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "genericValue"
    /// </summary>
    public bool IsGenericValue => Type == "genericValue";

    /// <summary>
    /// Returns the value as a <see cref="int"/> if <see cref="Type"/> is 'integerValue', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'integerValue'.</exception>
    public int AsIntegerValue() =>
        IsIntegerValue
            ? (int)Value!
            : throw new System.Exception("DebugVariableValue.Type is not 'integerValue'");

    /// <summary>
    /// Returns the value as a <see cref="bool"/> if <see cref="Type"/> is 'booleanValue', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'booleanValue'.</exception>
    public bool AsBooleanValue() =>
        IsBooleanValue
            ? (bool)Value!
            : throw new System.Exception("DebugVariableValue.Type is not 'booleanValue'");

    /// <summary>
    /// Returns the value as a <see cref="double"/> if <see cref="Type"/> is 'doubleValue', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'doubleValue'.</exception>
    public double AsDoubleValue() =>
        IsDoubleValue
            ? (double)Value!
            : throw new System.Exception("DebugVariableValue.Type is not 'doubleValue'");

    /// <summary>
    /// Returns the value as a <see cref="string"/> if <see cref="Type"/> is 'stringValue', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'stringValue'.</exception>
    public string AsStringValue() =>
        IsStringValue
            ? (string)Value!
            : throw new System.Exception("DebugVariableValue.Type is not 'stringValue'");

    /// <summary>
    /// Returns the value as a <see cref="string"/> if <see cref="Type"/> is 'charValue', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'charValue'.</exception>
    public string AsCharValue() =>
        IsCharValue
            ? (string)Value!
            : throw new System.Exception("DebugVariableValue.Type is not 'charValue'");

    /// <summary>
    /// Returns the value as a <see cref="SeedTrace.DebugMapValue"/> if <see cref="Type"/> is 'mapValue', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'mapValue'.</exception>
    public SeedTrace.DebugMapValue AsMapValue() =>
        IsMapValue
            ? (SeedTrace.DebugMapValue)Value!
            : throw new System.Exception("DebugVariableValue.Type is not 'mapValue'");

    /// <summary>
    /// Returns the value as a <see cref="IEnumerable<DebugVariableValue>"/> if <see cref="Type"/> is 'listValue', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'listValue'.</exception>
    public IEnumerable<DebugVariableValue> AsListValue() =>
        IsListValue
            ? (IEnumerable<DebugVariableValue>)Value!
            : throw new System.Exception("DebugVariableValue.Type is not 'listValue'");

    /// <summary>
    /// Returns the value as a <see cref="SeedTrace.BinaryTreeNodeAndTreeValue"/> if <see cref="Type"/> is 'binaryTreeNodeValue', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'binaryTreeNodeValue'.</exception>
    public SeedTrace.BinaryTreeNodeAndTreeValue AsBinaryTreeNodeValue() =>
        IsBinaryTreeNodeValue
            ? (SeedTrace.BinaryTreeNodeAndTreeValue)Value!
            : throw new System.Exception("DebugVariableValue.Type is not 'binaryTreeNodeValue'");

    /// <summary>
    /// Returns the value as a <see cref="SeedTrace.SinglyLinkedListNodeAndListValue"/> if <see cref="Type"/> is 'singlyLinkedListNodeValue', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'singlyLinkedListNodeValue'.</exception>
    public SeedTrace.SinglyLinkedListNodeAndListValue AsSinglyLinkedListNodeValue() =>
        IsSinglyLinkedListNodeValue
            ? (SeedTrace.SinglyLinkedListNodeAndListValue)Value!
            : throw new System.Exception(
                "DebugVariableValue.Type is not 'singlyLinkedListNodeValue'"
            );

    /// <summary>
    /// Returns the value as a <see cref="SeedTrace.DoublyLinkedListNodeAndListValue"/> if <see cref="Type"/> is 'doublyLinkedListNodeValue', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'doublyLinkedListNodeValue'.</exception>
    public SeedTrace.DoublyLinkedListNodeAndListValue AsDoublyLinkedListNodeValue() =>
        IsDoublyLinkedListNodeValue
            ? (SeedTrace.DoublyLinkedListNodeAndListValue)Value!
            : throw new System.Exception(
                "DebugVariableValue.Type is not 'doublyLinkedListNodeValue'"
            );

    /// <summary>
    /// Returns the value as a <see cref="object"/> if <see cref="Type"/> is 'undefinedValue', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'undefinedValue'.</exception>
    public object AsUndefinedValue() =>
        IsUndefinedValue
            ? Value!
            : throw new System.Exception("DebugVariableValue.Type is not 'undefinedValue'");

    /// <summary>
    /// Returns the value as a <see cref="object"/> if <see cref="Type"/> is 'nullValue', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'nullValue'.</exception>
    public object AsNullValue() =>
        IsNullValue
            ? Value!
            : throw new System.Exception("DebugVariableValue.Type is not 'nullValue'");

    /// <summary>
    /// Returns the value as a <see cref="SeedTrace.GenericValue"/> if <see cref="Type"/> is 'genericValue', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'genericValue'.</exception>
    public SeedTrace.GenericValue AsGenericValue() =>
        IsGenericValue
            ? (SeedTrace.GenericValue)Value!
            : throw new System.Exception("DebugVariableValue.Type is not 'genericValue'");

    public T Match<T>(
        Func<int, T> onIntegerValue,
        Func<bool, T> onBooleanValue,
        Func<double, T> onDoubleValue,
        Func<string, T> onStringValue,
        Func<string, T> onCharValue,
        Func<SeedTrace.DebugMapValue, T> onMapValue,
        Func<IEnumerable<DebugVariableValue>, T> onListValue,
        Func<SeedTrace.BinaryTreeNodeAndTreeValue, T> onBinaryTreeNodeValue,
        Func<SeedTrace.SinglyLinkedListNodeAndListValue, T> onSinglyLinkedListNodeValue,
        Func<SeedTrace.DoublyLinkedListNodeAndListValue, T> onDoublyLinkedListNodeValue,
        Func<object, T> onUndefinedValue,
        Func<object, T> onNullValue,
        Func<SeedTrace.GenericValue, T> onGenericValue,
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
            "binaryTreeNodeValue" => onBinaryTreeNodeValue(AsBinaryTreeNodeValue()),
            "singlyLinkedListNodeValue" => onSinglyLinkedListNodeValue(
                AsSinglyLinkedListNodeValue()
            ),
            "doublyLinkedListNodeValue" => onDoublyLinkedListNodeValue(
                AsDoublyLinkedListNodeValue()
            ),
            "undefinedValue" => onUndefinedValue(AsUndefinedValue()),
            "nullValue" => onNullValue(AsNullValue()),
            "genericValue" => onGenericValue(AsGenericValue()),
            _ => onUnknown_(Type, Value),
        };
    }

    public void Visit(
        Action<int> onIntegerValue,
        Action<bool> onBooleanValue,
        Action<double> onDoubleValue,
        Action<string> onStringValue,
        Action<string> onCharValue,
        Action<SeedTrace.DebugMapValue> onMapValue,
        Action<IEnumerable<DebugVariableValue>> onListValue,
        Action<SeedTrace.BinaryTreeNodeAndTreeValue> onBinaryTreeNodeValue,
        Action<SeedTrace.SinglyLinkedListNodeAndListValue> onSinglyLinkedListNodeValue,
        Action<SeedTrace.DoublyLinkedListNodeAndListValue> onDoublyLinkedListNodeValue,
        Action<object> onUndefinedValue,
        Action<object> onNullValue,
        Action<SeedTrace.GenericValue> onGenericValue,
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
            case "binaryTreeNodeValue":
                onBinaryTreeNodeValue(AsBinaryTreeNodeValue());
                break;
            case "singlyLinkedListNodeValue":
                onSinglyLinkedListNodeValue(AsSinglyLinkedListNodeValue());
                break;
            case "doublyLinkedListNodeValue":
                onDoublyLinkedListNodeValue(AsDoublyLinkedListNodeValue());
                break;
            case "undefinedValue":
                onUndefinedValue(AsUndefinedValue());
                break;
            case "nullValue":
                onNullValue(AsNullValue());
                break;
            case "genericValue":
                onGenericValue(AsGenericValue());
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
    /// Attempts to cast the value to a <see cref="SeedTrace.DebugMapValue"/> and returns true if successful.
    /// </summary>
    public bool TryAsMapValue(out SeedTrace.DebugMapValue? value)
    {
        if (Type == "mapValue")
        {
            value = (SeedTrace.DebugMapValue)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="IEnumerable<DebugVariableValue>"/> and returns true if successful.
    /// </summary>
    public bool TryAsListValue(out IEnumerable<DebugVariableValue>? value)
    {
        if (Type == "listValue")
        {
            value = (IEnumerable<DebugVariableValue>)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedTrace.BinaryTreeNodeAndTreeValue"/> and returns true if successful.
    /// </summary>
    public bool TryAsBinaryTreeNodeValue(out SeedTrace.BinaryTreeNodeAndTreeValue? value)
    {
        if (Type == "binaryTreeNodeValue")
        {
            value = (SeedTrace.BinaryTreeNodeAndTreeValue)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedTrace.SinglyLinkedListNodeAndListValue"/> and returns true if successful.
    /// </summary>
    public bool TryAsSinglyLinkedListNodeValue(
        out SeedTrace.SinglyLinkedListNodeAndListValue? value
    )
    {
        if (Type == "singlyLinkedListNodeValue")
        {
            value = (SeedTrace.SinglyLinkedListNodeAndListValue)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedTrace.DoublyLinkedListNodeAndListValue"/> and returns true if successful.
    /// </summary>
    public bool TryAsDoublyLinkedListNodeValue(
        out SeedTrace.DoublyLinkedListNodeAndListValue? value
    )
    {
        if (Type == "doublyLinkedListNodeValue")
        {
            value = (SeedTrace.DoublyLinkedListNodeAndListValue)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="object"/> and returns true if successful.
    /// </summary>
    public bool TryAsUndefinedValue(out object? value)
    {
        if (Type == "undefinedValue")
        {
            value = Value!;
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

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedTrace.GenericValue"/> and returns true if successful.
    /// </summary>
    public bool TryAsGenericValue(out SeedTrace.GenericValue? value)
    {
        if (Type == "genericValue")
        {
            value = (SeedTrace.GenericValue)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator DebugVariableValue(DebugVariableValue.IntegerValue value) =>
        new(value);

    public static implicit operator DebugVariableValue(DebugVariableValue.BooleanValue value) =>
        new(value);

    public static implicit operator DebugVariableValue(DebugVariableValue.DoubleValue value) =>
        new(value);

    public static implicit operator DebugVariableValue(DebugVariableValue.StringValue value) =>
        new(value);

    public static implicit operator DebugVariableValue(DebugVariableValue.CharValue value) =>
        new(value);

    public static implicit operator DebugVariableValue(DebugVariableValue.MapValue value) =>
        new(value);

    public static implicit operator DebugVariableValue(DebugVariableValue.ListValue value) =>
        new(value);

    public static implicit operator DebugVariableValue(
        DebugVariableValue.BinaryTreeNodeValue value
    ) => new(value);

    public static implicit operator DebugVariableValue(
        DebugVariableValue.SinglyLinkedListNodeValue value
    ) => new(value);

    public static implicit operator DebugVariableValue(
        DebugVariableValue.DoublyLinkedListNodeValue value
    ) => new(value);

    public static implicit operator DebugVariableValue(DebugVariableValue.GenericValue value) =>
        new(value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<DebugVariableValue>
    {
        public override bool CanConvert(System.Type typeToConvert) =>
            typeof(DebugVariableValue).IsAssignableFrom(typeToConvert);

        public override DebugVariableValue Read(
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
                "mapValue" => json.Deserialize<SeedTrace.DebugMapValue?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedTrace.DebugMapValue"),
                "listValue" => json.GetProperty("value")
                    .Deserialize<IEnumerable<DebugVariableValue>?>(options)
                ?? throw new JsonException("Failed to deserialize IEnumerable<DebugVariableValue>"),
                "binaryTreeNodeValue" => json.Deserialize<SeedTrace.BinaryTreeNodeAndTreeValue?>(
                    options
                )
                    ?? throw new JsonException(
                        "Failed to deserialize SeedTrace.BinaryTreeNodeAndTreeValue"
                    ),
                "singlyLinkedListNodeValue" =>
                    json.Deserialize<SeedTrace.SinglyLinkedListNodeAndListValue?>(options)
                        ?? throw new JsonException(
                            "Failed to deserialize SeedTrace.SinglyLinkedListNodeAndListValue"
                        ),
                "doublyLinkedListNodeValue" =>
                    json.Deserialize<SeedTrace.DoublyLinkedListNodeAndListValue?>(options)
                        ?? throw new JsonException(
                            "Failed to deserialize SeedTrace.DoublyLinkedListNodeAndListValue"
                        ),
                "undefinedValue" => new { },
                "nullValue" => new { },
                "genericValue" => json.Deserialize<SeedTrace.GenericValue?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedTrace.GenericValue"),
                _ => json.Deserialize<object?>(options),
            };
            return new DebugVariableValue(discriminator, value);
        }

        public override void Write(
            Utf8JsonWriter writer,
            DebugVariableValue value,
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
                    "binaryTreeNodeValue" => JsonSerializer.SerializeToNode(value.Value, options),
                    "singlyLinkedListNodeValue" => JsonSerializer.SerializeToNode(
                        value.Value,
                        options
                    ),
                    "doublyLinkedListNodeValue" => JsonSerializer.SerializeToNode(
                        value.Value,
                        options
                    ),
                    "undefinedValue" => null,
                    "nullValue" => null,
                    "genericValue" => JsonSerializer.SerializeToNode(value.Value, options),
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

        public static implicit operator DebugVariableValue.IntegerValue(int value) => new(value);
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

        public static implicit operator DebugVariableValue.BooleanValue(bool value) => new(value);
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

        public static implicit operator DebugVariableValue.DoubleValue(double value) => new(value);
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

        public static implicit operator DebugVariableValue.StringValue(string value) => new(value);
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

        public static implicit operator DebugVariableValue.CharValue(string value) => new(value);
    }

    /// <summary>
    /// Discriminated union type for mapValue
    /// </summary>
    [Serializable]
    public struct MapValue
    {
        public MapValue(SeedTrace.DebugMapValue value)
        {
            Value = value;
        }

        internal SeedTrace.DebugMapValue Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator DebugVariableValue.MapValue(
            SeedTrace.DebugMapValue value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for listValue
    /// </summary>
    [Serializable]
    public record ListValue
    {
        public ListValue(IEnumerable<DebugVariableValue> value)
        {
            Value = value;
        }

        internal IEnumerable<DebugVariableValue> Value { get; set; } =
            new List<DebugVariableValue>();

        public override string ToString() => Value.ToString() ?? "null";
    }

    /// <summary>
    /// Discriminated union type for binaryTreeNodeValue
    /// </summary>
    [Serializable]
    public struct BinaryTreeNodeValue
    {
        public BinaryTreeNodeValue(SeedTrace.BinaryTreeNodeAndTreeValue value)
        {
            Value = value;
        }

        internal SeedTrace.BinaryTreeNodeAndTreeValue Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator DebugVariableValue.BinaryTreeNodeValue(
            SeedTrace.BinaryTreeNodeAndTreeValue value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for singlyLinkedListNodeValue
    /// </summary>
    [Serializable]
    public struct SinglyLinkedListNodeValue
    {
        public SinglyLinkedListNodeValue(SeedTrace.SinglyLinkedListNodeAndListValue value)
        {
            Value = value;
        }

        internal SeedTrace.SinglyLinkedListNodeAndListValue Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator DebugVariableValue.SinglyLinkedListNodeValue(
            SeedTrace.SinglyLinkedListNodeAndListValue value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for doublyLinkedListNodeValue
    /// </summary>
    [Serializable]
    public struct DoublyLinkedListNodeValue
    {
        public DoublyLinkedListNodeValue(SeedTrace.DoublyLinkedListNodeAndListValue value)
        {
            Value = value;
        }

        internal SeedTrace.DoublyLinkedListNodeAndListValue Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator DebugVariableValue.DoublyLinkedListNodeValue(
            SeedTrace.DoublyLinkedListNodeAndListValue value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for undefinedValue
    /// </summary>
    [Serializable]
    public record UndefinedValue
    {
        internal object Value => new { };

        public override string ToString() => Value.ToString() ?? "null";
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

    /// <summary>
    /// Discriminated union type for genericValue
    /// </summary>
    [Serializable]
    public struct GenericValue
    {
        public GenericValue(SeedTrace.GenericValue value)
        {
            Value = value;
        }

        internal SeedTrace.GenericValue Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator DebugVariableValue.GenericValue(
            SeedTrace.GenericValue value
        ) => new(value);
    }
}
