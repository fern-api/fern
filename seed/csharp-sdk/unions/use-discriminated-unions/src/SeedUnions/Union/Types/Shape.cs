using SeedUnions.Core;

namespace SeedUnions;

public record Shape
{
    /// <summary>
    /// Discriminator property name for serialization/deserialization
    /// </summary>
    internal const string DiscriminatorName = "type";

    /// <summary>
    /// Create an instance of Shape with <see cref="Circle"/>.
    /// </summary>
    public Shape(Circle value)
    {
        Type = "circle";
        Value = value;
    }

    /// <summary>
    /// Create an instance of Shape with <see cref="Square"/>.
    /// </summary>
    public Shape(Square value)
    {
        Type = "square";
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
    /// Returns true if of type <see cref="Circle"/>.
    /// </summary>
    public bool IsCircle => Type == "circle";

    /// <summary>
    /// Returns true if of type <see cref="Square"/>.
    /// </summary>
    public bool IsSquare => Type == "square";

    /// <summary>
    /// Returns the value as a <see cref="Circle"/> if it is of that type, otherwise throws an exception.
    /// </summary>
    /// <exception cref="InvalidCastException">Thrown when the value is not an instance of <see cref="Circle"/>.</exception>
    public Circle AsCircle() => (Circle)Value;

    /// <summary>
    /// Returns the value as a <see cref="Square"/> if it is of that type, otherwise throws an exception.
    /// </summary>
    /// <exception cref="InvalidCastException">Thrown when the value is not an instance of <see cref="Square"/>.</exception>
    public Square AsSquare() => (Square)Value;

    public T Match<T>(Func<Circle, T> onCircle, Func<Square, T> onSquare)
    {
        return Type switch
        {
            "circle" => onCircle(AsCircle()),
            "square" => onSquare(AsSquare()),
            _ => throw new Exception($"Unexpected Type: {Type}"),
        };
    }

    public void Visit(Action<Circle> onCircle, Action<Square> onSquare)
    {
        switch (Type)
        {
            case "circle":
                onCircle(AsCircle());
                break;
            case "square":
                onSquare(AsSquare());
                break;
            default:
                throw new Exception($"Unexpected Type: {Type}");
        }
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="Circle"/> and returns true if successful.
    /// </summary>
    public bool TryAsCircle(out Circle? value)
    {
        if (Value is Circle asValue)
        {
            value = asValue;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="Square"/> and returns true if successful.
    /// </summary>
    public bool TryAsSquare(out Square? value)
    {
        if (Value is Square asValue)
        {
            value = asValue;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator Shape(Circle value) => new(value);

    public static implicit operator Shape(Square value) => new(value);
}
