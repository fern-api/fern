using NUnit.Framework.Constraints;

namespace NUnit.Framework;

/// <summary>
/// Extensions for NUnit constraints.
/// </summary>
public static class ReadOnlyMemoryComparerExtensions
{
    /// <summary>
    /// Extension method for comparing ReadOnlyMemory&lt;T&gt; in NUnit tests.
    /// </summary>
    /// <typeparam name="T">The type of elements in the ReadOnlyMemory.</typeparam>
    /// <param name="constraint">The Is.EqualTo() constraint instance.</param>
    /// <returns>A constraint that can compare ReadOnlyMemory&lt;T&gt;.</returns>
    public static EqualConstraint UsingReadOnlyMemoryComparer<T>(this EqualConstraint constraint)
        where T : IComparable<T>
    {
        return constraint.Using(new ReadOnlyMemoryComparer<T>());
    }
}

/// <summary>
/// Comparer for ReadOnlyMemory&lt;T&gt;. Compares sequences by value.
/// </summary>
/// <typeparam name="T">
/// The type of elements in the ReadOnlyMemory.
/// </typeparam>
public class ReadOnlyMemoryComparer<T> : IComparer<ReadOnlyMemory<T>>
    where T : IComparable<T>
{
    /// <inheritdoc />
    public int Compare(ReadOnlyMemory<T> x, ReadOnlyMemory<T> y)
    {
        // Check if sequences are equal
        var xSpan = x.Span;
        var ySpan = y.Span;

        // Optimized case for IEquatable implementations
        if (typeof(IEquatable<T>).IsAssignableFrom(typeof(T)))
        {
            var areEqual = xSpan.SequenceEqual(ySpan);
            if (areEqual)
            {
                return 0; // Sequences are equal
            }
        }
        else
        {
            // Manual equality check for non-IEquatable types
            if (xSpan.Length == ySpan.Length)
            {
                var areEqual = true;
                for (var i = 0; i < xSpan.Length; i++)
                {
                    if (!EqualityComparer<T>.Default.Equals(xSpan[i], ySpan[i]))
                    {
                        areEqual = false;
                        break;
                    }
                }

                if (areEqual)
                {
                    return 0; // Sequences are equal
                }
            }
        }

        // For non-equal sequences, we need to return a consistent ordering
        // First compare lengths
        if (x.Length != y.Length)
            return x.Length.CompareTo(y.Length);

        // Same length but different content - compare first differing element
        for (var i = 0; i < x.Length; i++)
        {
            if (!EqualityComparer<T>.Default.Equals(xSpan[i], ySpan[i]))
            {
                return xSpan[i].CompareTo(ySpan[i]);
            }
        }

        // Should never reach here if not equal
        return 0;
    }
}
