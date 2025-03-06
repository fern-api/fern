using SeedUnions.Core;

namespace SeedUnions;

public record UnionWithLiteral
{
    /// <summary>
    /// Discriminator property name for serialization/deserialization
    /// </summary>
    internal const string DiscriminatorName = "type";

    /// <summary>
    /// Create an instance of UnionWithLiteral with <see cref="string"/>.
    /// </summary>
    public UnionWithLiteral(string value)
    {
        Type = "fern";
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
    /// Returns true if of type <see cref="string"/>.
    /// </summary>
    public bool IsFern => Type == "fern";

    /// <summary>
    /// Returns the value as a <see cref="string"/> if it is of that type, otherwise throws an exception.
    /// </summary>
    /// <exception cref="InvalidCastException">Thrown when the value is not an instance of <see cref="string"/>.</exception>
    public string AsFern() => (string)Value;

    public T Match<T>(Func<string, T> onFern)
    {
        return Type switch
        {
            "fern" => onFern(AsFern()),
            _ => throw new Exception($"Unexpected Type: {Type}"),
        };
    }

    public void Visit(Action<string> onFern)
    {
        switch (Type)
        {
            case "fern":
                onFern(AsFern());
                break;
            default:
                throw new Exception($"Unexpected Type: {Type}");
        }
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="string"/> and returns true if successful.
    /// </summary>
    public bool TryAsFern(out string? value)
    {
        if (Value is string asValue)
        {
            value = asValue;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator UnionWithLiteral(string value) => new(value);
}
