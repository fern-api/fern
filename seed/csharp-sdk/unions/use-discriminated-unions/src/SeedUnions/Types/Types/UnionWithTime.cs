using SeedUnions.Core;

namespace SeedUnions;

public record UnionWithTime
{
    /// <summary>
    /// Discriminator property name for serialization/deserialization
    /// </summary>
    internal const string DiscriminatorName = "type";

    /// <summary>
    /// Create an instance of UnionWithTime with <see cref="int"/>.
    /// </summary>
    public UnionWithTime(int value)
    {
        Type = "value";
        Value = value;
    }

    /// <summary>
    /// Create an instance of UnionWithTime with <see cref="DateOnly"/>.
    /// </summary>
    public UnionWithTime(DateOnly value)
    {
        Type = "date";
        Value = value;
    }

    /// <summary>
    /// Create an instance of UnionWithTime with <see cref="DateTime"/>.
    /// </summary>
    public UnionWithTime(DateTime value)
    {
        Type = "datetime";
        Value = value;
    }

    /// <summary>
    /// Discriminant value
    /// </summary>
    public string Type { get; internal set; }

    /// <summary>
    /// Discriminated union value
    /// </summary>
    public object Value { get; internal set; }

    /// <summary>
    /// Returns true if of type <see cref="int"/>.
    /// </summary>
    public bool IsValue => Type == "value";

    /// <summary>
    /// Returns true if of type <see cref="DateOnly"/>.
    /// </summary>
    public bool IsDate => Type == "date";

    /// <summary>
    /// Returns true if of type <see cref="DateTime"/>.
    /// </summary>
    public bool IsDatetime => Type == "datetime";

    /// <summary>
    /// Returns the value as a <see cref="int"/> if it is of that type, otherwise throws an exception.
    /// </summary>
    /// <exception cref="InvalidCastException">Thrown when the value is not an instance of <see cref="int"/>.</exception>
    public int AsValue() => (int)Value;

    /// <summary>
    /// Returns the value as a <see cref="DateOnly"/> if it is of that type, otherwise throws an exception.
    /// </summary>
    /// <exception cref="InvalidCastException">Thrown when the value is not an instance of <see cref="DateOnly"/>.</exception>
    public DateOnly AsDate() => (DateOnly)Value;

    /// <summary>
    /// Returns the value as a <see cref="DateTime"/> if it is of that type, otherwise throws an exception.
    /// </summary>
    /// <exception cref="InvalidCastException">Thrown when the value is not an instance of <see cref="DateTime"/>.</exception>
    public DateTime AsDatetime() => (DateTime)Value;

    public T Match<T>(Func<int, T> onValue, Func<DateOnly, T> onDate, Func<DateTime, T> onDatetime)
    {
        return Type switch
        {
            "value" => onValue(AsValue()),
            "date" => onDate(AsDate()),
            "datetime" => onDatetime(AsDatetime()),
            _ => throw new Exception($"Unexpected Type: {Type}"),
        };
    }

    public void Visit(Action<int> onValue, Action<DateOnly> onDate, Action<DateTime> onDatetime)
    {
        switch (Type)
        {
            case "value":
                onValue(AsValue());
                break;
            case "date":
                onDate(AsDate());
                break;
            case "datetime":
                onDatetime(AsDatetime());
                break;
            default:
                throw new Exception($"Unexpected Type: {Type}");
        }
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="int"/> and returns true if successful.
    /// </summary>
    public bool TryAsValue(out int? value)
    {
        if (Value is int asValue)
        {
            value = asValue;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="DateOnly"/> and returns true if successful.
    /// </summary>
    public bool TryAsDate(out DateOnly? value)
    {
        if (Value is DateOnly asValue)
        {
            value = asValue;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="DateTime"/> and returns true if successful.
    /// </summary>
    public bool TryAsDatetime(out DateTime? value)
    {
        if (Value is DateTime asValue)
        {
            value = asValue;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator UnionWithTime(int value) => new(value);

    public static implicit operator UnionWithTime(DateOnly value) => new(value);

    public static implicit operator UnionWithTime(DateTime value) => new(value);
}
