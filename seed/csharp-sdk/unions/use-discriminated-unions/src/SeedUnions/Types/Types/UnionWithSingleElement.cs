using SeedUnions.Core;

namespace SeedUnions;

public record UnionWithSingleElement
{
    /// <summary>
    /// Discriminator property name for serialization/deserialization
    /// </summary>
    internal const string DiscriminatorName = "type";

    /// <summary>
    /// Create an instance of UnionWithSingleElement with <see cref="Foo"/>.
    /// </summary>
    public UnionWithSingleElement(Foo value)
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
    /// Returns true if of type <see cref="Foo"/>.
    /// </summary>
    public bool IsFoo => Type == "foo";

    /// <summary>
    /// Returns the value as a <see cref="Foo"/> if it is of that type, otherwise throws an exception.
    /// </summary>
    /// <exception cref="InvalidCastException">Thrown when the value is not an instance of <see cref="Foo"/>.</exception>
    public Foo AsFoo() => (Foo)Value;

    public T Match<T>(Func<Foo, T> onFoo)
    {
        return Type switch
        {
            "foo" => onFoo(AsFoo()),
            _ => throw new Exception($"Unexpected Type: {Type}"),
        };
    }

    public void Visit(Action<Foo> onFoo)
    {
        switch (Type)
        {
            case "foo":
                onFoo(AsFoo());
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

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator UnionWithSingleElement(Foo value) => new(value);
}
