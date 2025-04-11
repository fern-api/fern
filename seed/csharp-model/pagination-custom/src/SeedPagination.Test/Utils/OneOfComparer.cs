using NUnit.Framework.Constraints;
using OneOf;

namespace NUnit.Framework;

/// <summary>
/// Extensions for EqualConstraint to handle OneOf values.
/// </summary>
public static class EqualConstraintExtensions
{
    /// <summary>
    /// Modifies the EqualConstraint to handle OneOf instances by comparing their inner values.
    /// This works alongside other comparison modifiers like UsingPropertiesComparer.
    /// </summary>
    /// <param name="constraint">The EqualConstraint to modify.</param>
    /// <returns>The same constraint instance for method chaining.</returns>
    public static EqualConstraint UsingOneOfComparer(this EqualConstraint constraint)
    {
        // Register a comparer factory for IOneOf types
        constraint.Using<IOneOf>(
            (x, y) =>
            {
                // ReSharper disable ConditionIsAlwaysTrueOrFalseAccordingToNullableAPIContract
                if (x.Value is null && y.Value is null)
                {
                    return true;
                }

                if (x.Value is null)
                {
                    return false;
                }

                var propertiesComparer = new NUnitEqualityComparer();
                var tolerance = Tolerance.Default;
                propertiesComparer.CompareProperties = true;
                return propertiesComparer.AreEqual(x.Value, y.Value, ref tolerance);
            }
        );

        return constraint;
    }
}
