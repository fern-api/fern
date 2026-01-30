using NUnit.Framework.Constraints;
using OneOf;
using SeedExtraProperties.Core;

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
                // Add OneOf comparer to handle nested OneOf values (e.g., in Lists within Optional<T>)
                propertiesComparer.ExternalComparers.Add(
                    new OneOfEqualityAdapter(propertiesComparer)
                );
                return propertiesComparer.AreEqual(xValue, yValue, ref tolerance);
            }
        );

        return constraint;
    }

    /// <summary>
    /// EqualityAdapter for comparing IOneOf instances within NUnitEqualityComparer.
    /// This enables recursive comparison of nested OneOf values within Optional<T> types.
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
