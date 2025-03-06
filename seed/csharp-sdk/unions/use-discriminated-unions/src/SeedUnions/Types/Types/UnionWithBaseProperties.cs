using SeedUnions.Core;

namespace SeedUnions;

public record UnionWithBaseProperties
{
    /// <summary>
    /// Discriminator property name for serialization/deserialization
    /// </summary>
    internal const string DiscriminatorName = "type";

    /// <summary>
    /// Create an instance of UnionWithBaseProperties with <see cref="int"/>.
    /// </summary>
    public UnionWithBaseProperties(int value)
    {
        Type = "integer";
        Value = value;
    }

    /// <summary>
    /// Create an instance of UnionWithBaseProperties with <see cref="string"/>.
    /// </summary>
    public UnionWithBaseProperties(string value)
    {
        Type = "string";
        Value = value;
    }

    /// <summary>
    /// Create an instance of UnionWithBaseProperties with <see cref="Foo"/>.
    /// </summary>
    public UnionWithBaseProperties(Foo value)
    {
        Type = "foo";
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
    public bool IsInteger => Type == "integer";

    /// <summary>
    /// Returns true if of type <see cref="string"/>.
    /// </summary>
    public bool IsString => Type == "string";

    /// <summary>
    /// Returns true if of type <see cref="Foo"/>.
    /// </summary>
    public bool IsFoo => Type == "foo";

    /// <summary>
    /// Returns the value as a <see cref="int"/> if it is of that type, otherwise throws an exception.
    /// </summary>
    /// <exception cref="InvalidCastException">Thrown when the value is not an instance of <see cref="int"/>.</exception>
    public int AsInteger() => (int)Value;

    /// <summary>
    /// Returns the value as a <see cref="string"/> if it is of that type, otherwise throws an exception.
    /// </summary>
    /// <exception cref="InvalidCastException">Thrown when the value is not an instance of <see cref="string"/>.</exception>
    public string AsString() => (string)Value;

    /// <summary>
    /// Returns the value as a <see cref="Foo"/> if it is of that type, otherwise throws an exception.
    /// </summary>
    /// <exception cref="InvalidCastException">Thrown when the value is not an instance of <see cref="Foo"/>.</exception>
    public Foo AsFoo() => (Foo)Value;

    public T Match<T>(Func<int, T> onInteger, Func<string, T> onString, Func<Foo, T> onFoo)
    {
        return Type switch
        {
            "integer" => onInteger(AsInteger()),
            "string" => onString(AsString()),
            "foo" => onFoo(AsFoo()),
            _ => throw new Exception($"Unexpected Type: {Type}"),
        };
    }

    public void Visit(Action<int> onInteger, Action<string> onString, Action<Foo> onFoo)
    {
        switch (Type)
        {
            case "integer":
                onInteger(AsInteger());
                break;
            case "string":
                onString(AsString());
                break;
            case "foo":
                onFoo(AsFoo());
                break;
            default:
                throw new Exception($"Unexpected Type: {Type}");
        }
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="int"/> and returns true if successful.
    /// </summary>
    public bool TryAsInteger(out int? value)
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
    /// Attempts to cast the value to a <see cref="string"/> and returns true if successful.
    /// </summary>
    public bool TryAsString(out string? value)
    {
        if (Value is string asValue)
        {
            value = asValue;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="Foo"/> and returns true if successful.
    /// </summary>
    public bool TryAsFoo(out Foo? value)
    {
        if (Value is Foo asValue)
        {
            value = asValue;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator UnionWithBaseProperties(int value) => new(value);

    public static implicit operator UnionWithBaseProperties(string value) => new(value);

    public static implicit operator UnionWithBaseProperties(Foo value) => new(value);
}
