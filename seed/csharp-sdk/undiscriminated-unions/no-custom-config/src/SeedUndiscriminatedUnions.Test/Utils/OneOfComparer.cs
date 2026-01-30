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
                // Add OneOf comparer to handle nested OneOf values (e.g., in Lists)
                propertiesComparer.ExternalComparers.Add(
                    new OneOfEqualityAdapter(propertiesComparer)
                );
                return propertiesComparer.AreEqual(x.Value, y.Value, ref tolerance);
            }
        );

        return constraint;
    }

    /// <summary>
    /// EqualityAdapter for comparing IOneOf instances within NUnitEqualityComparer.
    /// This enables recursive comparison of nested OneOf values.
    /// </summary>
    private class OneOfEqualityAdapter : EqualityAdapter
    {
        private readonly NUnitEqualityComparer _comparer;

        public OneOfEqualityAdapter(NUnitEqualityComparer comparer)
        {
            _comparer = comparer;
        }

        public override bool CanCompare(object? x, object? y)
        {
            return x is IOneOf && y is IOneOf;
        }

        public override bool AreEqual(object? x, object? y)
        {
            var oneOfX = (IOneOf?)x;
            var oneOfY = (IOneOf?)y;

            // ReSharper disable ConditionIsAlwaysTrueOrFalseAccordingToNullableAPIContract
            if (oneOfX?.Value is null && oneOfY?.Value is null)
            {
                return true;
            }

            if (oneOfX?.Value is null || oneOfY?.Value is null)
            {
                return false;
            }

            var tolerance = Tolerance.Default;
            return _comparer.AreEqual(oneOfX.Value, oneOfY.Value, ref tolerance);
        }
    }
}
