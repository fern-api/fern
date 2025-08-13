using System.Text.Json.Serialization;

namespace SeedRequestParameters.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
