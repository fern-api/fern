using SeedUnions.Core;

namespace SeedUnions;

public record Union
{
    /// <summary>
    /// Discriminator property name for serialization/deserialization
    /// </summary>
    internal const string DiscriminatorName = "type";

    /// <summary>
    /// Create an instance of Union with <see cref="Foo"/>.
    /// </summary>
    public Union(Foo value)
    {
        Type = "foo";
        Value = value;
    }

    /// <summary>
    /// Create an instance of Union with <see cref="Bar"/>.
    /// </summary>
    public Union(Bar value)
    {
        Type = "bar";
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
    /// Returns true if of type <see cref="Foo"/>.
    /// </summary>
    public bool IsFoo => Type == "foo";

    /// <summary>
    /// Returns true if of type <see cref="Bar"/>.
    /// </summary>
    public bool IsBar => Type == "bar";

    /// <summary>
    /// Returns the value as a <see cref="Foo"/> if it is of that type, otherwise throws an exception.
    /// </summary>
    /// <exception cref="InvalidCastException">Thrown when the value is not an instance of <see cref="Foo"/>.</exception>
    public Foo AsFoo() => (Foo)Value;

    /// <summary>
    /// Returns the value as a <see cref="Bar"/> if it is of that type, otherwise throws an exception.
    /// </summary>
    /// <exception cref="InvalidCastException">Thrown when the value is not an instance of <see cref="Bar"/>.</exception>
    public Bar AsBar() => (Bar)Value;

    public T Match<T>(Func<Foo, T> onFoo, Func<Bar, T> onBar)
    {
        return Type switch
        {
            "foo" => onFoo(AsFoo()),
            "bar" => onBar(AsBar()),
            _ => throw new Exception($"Unexpected Type: {Type}"),
        };
    }

    public void Visit(Action<Foo> onFoo, Action<Bar> onBar)
    {
        switch (Type)
        {
            case "foo":
                onFoo(AsFoo());
                break;
            case "bar":
                onBar(AsBar());
                break;
            default:
                throw new Exception($"Unexpected Type: {Type}");
        }
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

    /// <summary>
    /// Attempts to cast the value to a <see cref="Bar"/> and returns true if successful.
    /// </summary>
    public bool TryAsBar(out Bar? value)
    {
        if (Value is Bar asValue)
        {
            value = asValue;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator Union(Foo value) => new(value);

    public static implicit operator Union(Bar value) => new(value);
}
