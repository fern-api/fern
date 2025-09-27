using NUnit.Framework.Constraints;

namespace NUnit.Framework;

/// <summary>
/// Extensions for NUnit constraints.
/// </summary>
public static class NUnitExtensions
{
    /// <summary>
    /// Modifies the EqualConstraint to use our own set of default comparers.
    /// </summary>
    /// <param name="constraint"></param>
    /// <returns></returns>
    public static EqualConstraint UsingDefaults(this EqualConstraint constraint) =>
        constraint
            .UsingPropertiesComparer()
            .UsingReadOnlyMemoryComparer<int>()
            .UsingReadOnlyMemoryComparer<uint>()
            .UsingReadOnlyMemoryComparer<long>()
            .UsingReadOnlyMemoryComparer<ulong>()
            .UsingReadOnlyMemoryComparer<string>()
            .UsingReadOnlyMemoryComparer<bool>()
            .UsingReadOnlyMemoryComparer<float>()
            .UsingReadOnlyMemoryComparer<double>()
            .UsingOneOfComparer()
            .UsingJsonElementComparer();
}
