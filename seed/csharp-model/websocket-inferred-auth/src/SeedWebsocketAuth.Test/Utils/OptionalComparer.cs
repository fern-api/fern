using NUnit.Framework.Constraints;
using SeedWebsocketAuth.Core;

namespace NUnit.Framework;

/// <summary>
/// Extensions for EqualConstraint to handle Optional values.
/// </summary>
public static class OptionalComparerExtensions
{
    /// <summary>
    /// Modifies the EqualConstraint to handle Optional instances by comparing their IsDefined state and inner values.
    /// This works alongside other comparison modifiers like UsingPropertiesComparer.
    /// </summary>
    /// <param name="constraint">The EqualConstraint to modify.</param>
    /// <returns>The same constraint instance for method chaining.</returns>
    public static EqualConstraint UsingOptionalComparer(this EqualConstraint constraint)
    {
        // Register a comparer factory for IOptional types
        constraint.Using<IOptional>(
            (x, y) =>
            {
                // Both must have the same IsDefined state
                if (x.IsDefined != y.IsDefined)
                {
                    return false;
                }

                // If both are undefined, they're equal
                if (!x.IsDefined)
                {
                    return true;
                }

                // Both are defined, compare their boxed values
                var xValue = x.GetBoxedValue();
                var yValue = y.GetBoxedValue();

                // ReSharper disable ConditionIsAlwaysTrueOrFalseAccordingToNullableAPIContract
                if (xValue is null && yValue is null)
                {
                    return true;
                }

                if (xValue is null || yValue is null)
                {
                    return false;
                }

                // Use NUnit's property comparer for the inner values
                var propertiesComparer = new NUnitEqualityComparer();
                var tolerance = Tolerance.Default;
                propertiesComparer.CompareProperties = true;
                return propertiesComparer.AreEqual(xValue, yValue, ref tolerance);
            }
        );

        return constraint;
    }
}
