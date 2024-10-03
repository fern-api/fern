using System;

namespace SeedEnum.Core
{
    public abstract class StringEnum : IEquatable<string>
    {
        public abstract string Value { get; }

        public override string ToString()
        {
            return Value;
        }

        public bool Equals(string? other)
        {
            return Value.Equals(other);
        }

        public override bool Equals(object? obj)
        {
            if (obj is null)
                return false;
            if (obj is string stringObj)
                return Value.Equals(stringObj);
            if (obj.GetType() != GetType())
                return false;
            return Equals((AbstractStringEnum)obj);
        }

        public override int GetHashCode()
        {
            return Value.GetHashCode();
        }

        public static bool operator ==(AbstractStringEnum value1, AbstractStringEnum value2) => value1.Equals(value2);

        public static bool operator !=(AbstractStringEnum value1, AbstractStringEnum value2) => !(value1 == value2);

        public static bool operator ==(AbstractStringEnum value1, string value2) => value1.Value.Equals(value2);

        public static bool operator !=(AbstractStringEnum value1, string value2) => !value1.Value.Equals(value2);
    }
}