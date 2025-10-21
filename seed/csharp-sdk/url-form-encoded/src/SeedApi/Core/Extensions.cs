using System.Diagnostics.CodeAnalysis;
using System.Runtime.Serialization;

namespace SeedApi.Core;

internal static class Extensions
{
    public static string Stringify(this Enum value)
    {
        var field = value.GetType().GetField(value.ToString());
        if (field != null)
        {
            var attribute = (EnumMemberAttribute?)
                Attribute.GetCustomAttribute(field, typeof(EnumMemberAttribute));
            return attribute?.Value ?? value.ToString();
        }
        return value.ToString();
    }

    /// <summary>
    /// Asserts that a condition is true, throwing an exception with the specified message if it is false.
    /// </summary>
    /// <param name="condition">The condition to assert.</param>
    /// <param name="message">The exception message if the assertion fails.</param>
    /// <exception cref="Exception">Thrown when the condition is false.</exception>
    internal static void Assert(this object value, bool condition, string message)
    {
        if (!condition)
        {
            throw new global::System.Exception(message);
        }
    }

    /// <summary>
    /// Asserts that a value is not null, throwing an exception with the specified message if it is null.
    /// </summary>
    /// <typeparam name="TValue">The type of the value to assert.</typeparam>
    /// <param name="value">The value to assert is not null.</param>
    /// <param name="message">The exception message if the assertion fails.</param>
    /// <returns>The non-null value.</returns>
    /// <exception cref="Exception">Thrown when the value is null.</exception>
    internal static TValue Assert<TValue>(
        this object _unused,
        [NotNull] TValue? value,
        string message
    )
        where TValue : class
    {
        if (value == null)
        {
            throw new global::System.Exception(message);
        }
        return value;
    }
}
