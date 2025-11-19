// ReSharper disable All
#pragma warning disable

// Licensed to the .NET Foundation under one or more agreements.
// The .NET Foundation licenses this file to you under the MIT license.

using global::System.Diagnostics;
using global::System.Diagnostics.CodeAnalysis;
using global::System.Globalization;
using global::System.Runtime.CompilerServices;
using global::System.Runtime.InteropServices;
using global::System.Text.Json;
using global::System.Text.Json.Serialization;

// ReSharper disable SuggestVarOrType_SimpleTypes
// ReSharper disable SuggestVarOrType_BuiltInTypes

namespace SeedUnions.Core
{
    /// <summary>
    /// Custom converter for handling the <see cref="DateOnly"/> data type with the <see href="https://docs.microsoft.com/dotnet/api/system.text.json">System.Text.Json</see> library.
    /// </summary>
    /// <remarks>
    /// This class backported from:
    /// <see href="https://github.com/dotnet/runtime/blob/main/src/libraries/System.Text.Json/src/System/Text/Json/Serialization/Converters/Value/DateOnlyConverter.cs">
    /// System.Text.Json.Serialization.Converters.DateOnlyConverter</see>
    /// </remarks>
    public sealed class DateOnlyConverter : JsonConverter<DateOnly>
    {
        private const int FormatLength = 10; // YYYY-MM-DD

        private const int MaxEscapedFormatLength =
            FormatLength * JsonConstants.MaxExpansionFactorWhileEscaping;

        /// <inheritdoc />
        public override DateOnly Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType != JsonTokenType.String)
            {
                ThrowHelper.ThrowInvalidOperationException_ExpectedString(reader.TokenType);
            }

            return ReadCore(ref reader);
        }

        /// <inheritdoc />
        public override DateOnly ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            Debug.Assert(reader.TokenType == JsonTokenType.PropertyName);
            return ReadCore(ref reader);
        }

        private static DateOnly ReadCore(ref Utf8JsonReader reader)
        {
            if (
                !JsonHelpers.IsInRangeInclusive(
                    reader.ValueLength(),
                    FormatLength,
                    MaxEscapedFormatLength
                )
            )
            {
                ThrowHelper.ThrowFormatException(DataType.DateOnly);
            }

            scoped ReadOnlySpan<byte> source;
            if (!reader.HasValueSequence && !reader.ValueIsEscaped)
            {
                source = reader.ValueSpan;
            }
            else
            {
                Span<byte> stackSpan = stackalloc byte[MaxEscapedFormatLength];
                int bytesWritten = reader.CopyString(stackSpan);
                source = stackSpan.Slice(0, bytesWritten);
            }

            if (!JsonHelpers.TryParseAsIso(source, out DateOnly value))
            {
                ThrowHelper.ThrowFormatException(DataType.DateOnly);
            }

            return value;
        }

        /// <inheritdoc />
        public override void Write(
            Utf8JsonWriter writer,
            DateOnly value,
            JsonSerializerOptions options
        )
        {
#if NET8_0_OR_GREATER
            Span<byte> buffer = stackalloc byte[FormatLength];
#else
            Span<char> buffer = stackalloc char[FormatLength];
#endif
            // ReSharper disable once RedundantAssignment
            bool formattedSuccessfully = value.TryFormat(
                buffer,
                out int charsWritten,
                "O".AsSpan(),
                CultureInfo.InvariantCulture
            );
            Debug.Assert(formattedSuccessfully && charsWritten == FormatLength);
            writer.WriteStringValue(buffer);
        }

        /// <inheritdoc />
        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            DateOnly value,
            JsonSerializerOptions options
        )
        {
#if NET8_0_OR_GREATER
            Span<byte> buffer = stackalloc byte[FormatLength];
#else
            Span<char> buffer = stackalloc char[FormatLength];
#endif
            // ReSharper disable once RedundantAssignment
            bool formattedSuccessfully = value.TryFormat(
                buffer,
                out int charsWritten,
                "O".AsSpan(),
                CultureInfo.InvariantCulture
            );
            Debug.Assert(formattedSuccessfully && charsWritten == FormatLength);
            writer.WritePropertyName(buffer);
        }
    }

    internal static class JsonConstants
    {
        // The maximum number of fraction digits the Json DateTime parser allows
        public const int DateTimeParseNumFractionDigits = 16;

        // In the worst case, an ASCII character represented as a single utf-8 byte could expand 6x when escaped.
        public const int MaxExpansionFactorWhileEscaping = 6;

        // The largest fraction expressible by TimeSpan and DateTime formats
        public const int MaxDateTimeFraction = 9_999_999;

        // TimeSpan and DateTime formats allow exactly up to many digits for specifying the fraction after the seconds.
        public const int DateTimeNumFractionDigits = 7;

        public const byte UtcOffsetToken = (byte)'Z';

        public const byte TimePrefix = (byte)'T';

        public const byte Period = (byte)'.';

        public const byte Hyphen = (byte)'-';

        public const byte Colon = (byte)':';

        public const byte Plus = (byte)'+';
    }

    // ReSharper disable SuggestVarOrType_Elsewhere
    // ReSharper disable SuggestVarOrType_SimpleTypes
    // ReSharper disable SuggestVarOrType_BuiltInTypes

    internal static class JsonHelpers
    {
        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public static bool IsInRangeInclusive(int value, int lowerBound, int upperBound) =>
            (uint)(value - lowerBound) <= (uint)(upperBound - lowerBound);

        public static bool IsDigit(byte value) => (uint)(value - '0') <= '9' - '0';

        [StructLayout(LayoutKind.Auto)]
        private struct DateTimeParseData
        {
            public int Year;
            public int Month;
            public int Day;
            public bool IsCalendarDateOnly;
            public int Hour;
            public int Minute;
            public int Second;
            public int Fraction; // This value should never be greater than 9_999_999.
            public int OffsetHours;
            public int OffsetMinutes;

            // ReSharper disable once NotAccessedField.Local
            public byte OffsetToken;
        }

        public static bool TryParseAsIso(ReadOnlySpan<byte> source, out DateOnly value)
        {
            if (
                TryParseDateTimeOffset(source, out DateTimeParseData parseData)
                && parseData.IsCalendarDateOnly
                && TryCreateDateTime(parseData, DateTimeKind.Unspecified, out DateTime dateTime)
            )
            {
                value = DateOnly.FromDateTime(dateTime);
                return true;
            }

            value = default;
            return false;
        }

        /// <summary>
        /// ISO 8601 date time parser (ISO 8601-1:2019).
        /// </summary>
        /// <param name="source">The date/time to parse in UTF-8 format.</param>
        /// <param name="parseData">The parsed <see cref="DateTimeParseData"/> for the given <paramref name="source"/>.</param>
        /// <remarks>
        /// Supports extended calendar date (5.2.2.1) and complete (5.4.2.1) calendar date/time of day
        /// representations with optional specification of seconds and fractional seconds.
        ///
        /// Times can be explicitly specified as UTC ("Z" - 5.3.3) or offsets from UTC ("+/-hh:mm" 5.3.4.2).
        /// If unspecified they are considered to be local per spec.
        ///
        /// Examples: (TZD is either "Z" or hh:mm offset from UTC)
        ///
        ///  YYYY-MM-DD               (e.g. 1997-07-16)
        ///  YYYY-MM-DDThh:mm         (e.g. 1997-07-16T19:20)
        ///  YYYY-MM-DDThh:mm:ss      (e.g. 1997-07-16T19:20:30)
        ///  YYYY-MM-DDThh:mm:ss.s    (e.g. 1997-07-16T19:20:30.45)
        ///  YYYY-MM-DDThh:mmTZD      (e.g. 1997-07-16T19:20+01:00)
        ///  YYYY-MM-DDThh:mm:ssTZD   (e.g. 1997-07-16T19:20:3001:00)
        ///  YYYY-MM-DDThh:mm:ss.sTZD (e.g. 1997-07-16T19:20:30.45Z)
        ///
        /// Generally speaking we always require the "extended" option when one exists (3.1.3.5).
        /// The extended variants have separator characters between components ('-', ':', '.', etc.).
        /// Spaces are not permitted.
        /// </remarks>
        /// <returns>"true" if successfully parsed.</returns>
        private static bool TryParseDateTimeOffset(
            ReadOnlySpan<byte> source,
            out DateTimeParseData parseData
        )
        {
            parseData = default;

            // too short datetime
            Debug.Assert(source.Length >= 10);

            // Parse the calendar date
            // -----------------------
            // ISO 8601-1:2019 5.2.2.1b "Calendar date complete extended format"
            //  [dateX] = [year]["-"][month]["-"][day]
            //  [year]  = [YYYY] [0000 - 9999] (4.3.2)
            //  [month] = [MM] [01 - 12] (4.3.3)
            //  [day]   = [DD] [01 - 28, 29, 30, 31] (4.3.4)
            //
            // Note: 5.2.2.2 "Representations with reduced precision" allows for
            // just [year]["-"][month] (a) and just [year] (b), but we currently
            // don't permit it.

            {
                uint digit1 = source[0] - (uint)'0';
                uint digit2 = source[1] - (uint)'0';
                uint digit3 = source[2] - (uint)'0';
                uint digit4 = source[3] - (uint)'0';

                if (digit1 > 9 || digit2 > 9 || digit3 > 9 || digit4 > 9)
                {
                    return false;
                }

                parseData.Year = (int)(digit1 * 1000 + digit2 * 100 + digit3 * 10 + digit4);
            }

            if (
                source[4] != JsonConstants.Hyphen
                || !TryGetNextTwoDigits(source.Slice(start: 5, length: 2), ref parseData.Month)
                || source[7] != JsonConstants.Hyphen
                || !TryGetNextTwoDigits(source.Slice(start: 8, length: 2), ref parseData.Day)
            )
            {
                return false;
            }

            // We now have YYYY-MM-DD [dateX]
            // ReSharper disable once ConvertIfStatementToSwitchStatement
            if (source.Length == 10)
            {
                parseData.IsCalendarDateOnly = true;
                return true;
            }

            // Parse the time of day
            // ---------------------
            //
            // ISO 8601-1:2019 5.3.1.2b "Local time of day complete extended format"
            //  [timeX]   = ["T"][hour][":"][min][":"][sec]
            //  [hour]    = [hh] [00 - 23] (4.3.8a)
            //  [minute]  = [mm] [00 - 59] (4.3.9a)
            //  [sec]     = [ss] [00 - 59, 60 with a leap second] (4.3.10a)
            //
            // ISO 8601-1:2019 5.3.3 "UTC of day"
            //  [timeX]["Z"]
            //
            // ISO 8601-1:2019 5.3.4.2 "Local time of day with the time shift between
            // local timescale and UTC" (Extended format)
            //
            //  [shiftX] = ["+"|"-"][hour][":"][min]
            //
            // Notes:
            //
            // "T" is optional per spec, but _only_ when times are used alone. In our
            // case, we're reading out a complete date & time and as such require "T".
            // (5.4.2.1b).
            //
            // For [timeX] We allow seconds to be omitted per 5.3.1.3a "Representations
            // with reduced precision". 5.3.1.3b allows just specifying the hour, but
            // we currently don't permit this.
            //
            // Decimal fractions are allowed for hours, minutes and seconds (5.3.14).
            // We only allow fractions for seconds currently. Lower order components
            // can't follow, i.e. you can have T23.3, but not T23.3:04. There must be
            // one digit, but the max number of digits is implementation defined. We
            // currently allow up to 16 digits of fractional seconds only. While we
            // support 16 fractional digits we only parse the first seven, anything
            // past that is considered a zero. This is to stay compatible with the
            // DateTime implementation which is limited to this resolution.

            if (source.Length < 16)
            {
                // Source does not have enough characters for YYYY-MM-DDThh:mm
                return false;
            }

            // Parse THH:MM (e.g. "T10:32")
            if (
                source[10] != JsonConstants.TimePrefix
                || source[13] != JsonConstants.Colon
                || !TryGetNextTwoDigits(source.Slice(start: 11, length: 2), ref parseData.Hour)
                || !TryGetNextTwoDigits(source.Slice(start: 14, length: 2), ref parseData.Minute)
            )
            {
                return false;
            }

            // We now have YYYY-MM-DDThh:mm
            Debug.Assert(source.Length >= 16);
            if (source.Length == 16)
            {
                return true;
            }

            byte curByte = source[16];
            int sourceIndex = 17;

            // Either a TZD ['Z'|'+'|'-'] or a seconds separator [':'] is valid at this point
            switch (curByte)
            {
                case JsonConstants.UtcOffsetToken:
                    parseData.OffsetToken = JsonConstants.UtcOffsetToken;
                    return sourceIndex == source.Length;
                case JsonConstants.Plus:
                case JsonConstants.Hyphen:
                    parseData.OffsetToken = curByte;
                    return ParseOffset(ref parseData, source.Slice(sourceIndex));
                case JsonConstants.Colon:
                    break;
                default:
                    return false;
            }

            // Try reading the seconds
            if (
                source.Length < 19
                || !TryGetNextTwoDigits(source.Slice(start: 17, length: 2), ref parseData.Second)
            )
            {
                return false;
            }

            // We now have YYYY-MM-DDThh:mm:ss
            Debug.Assert(source.Length >= 19);
            if (source.Length == 19)
            {
                return true;
            }

            curByte = source[19];
            sourceIndex = 20;

            // Either a TZD ['Z'|'+'|'-'] or a seconds decimal fraction separator ['.'] is valid at this point
            switch (curByte)
            {
                case JsonConstants.UtcOffsetToken:
                    parseData.OffsetToken = JsonConstants.UtcOffsetToken;
                    return sourceIndex == source.Length;
                case JsonConstants.Plus:
                case JsonConstants.Hyphen:
                    parseData.OffsetToken = curByte;
                    return ParseOffset(ref parseData, source.Slice(sourceIndex));
                case JsonConstants.Period:
                    break;
                default:
                    return false;
            }

            // Source does not have enough characters for second fractions (i.e. ".s")
            // YYYY-MM-DDThh:mm:ss.s
            if (source.Length < 21)
            {
                return false;
            }

            // Parse fraction. This value should never be greater than 9_999_999
            int numDigitsRead = 0;
            int fractionEnd = Math.Min(
                sourceIndex + JsonConstants.DateTimeParseNumFractionDigits,
                source.Length
            );

            while (sourceIndex < fractionEnd && IsDigit(curByte = source[sourceIndex]))
            {
                if (numDigitsRead < JsonConstants.DateTimeNumFractionDigits)
                {
                    parseData.Fraction = parseData.Fraction * 10 + (int)(curByte - (uint)'0');
                    numDigitsRead++;
                }

                sourceIndex++;
            }

            if (parseData.Fraction != 0)
            {
                while (numDigitsRead < JsonConstants.DateTimeNumFractionDigits)
                {
                    parseData.Fraction *= 10;
                    numDigitsRead++;
                }
            }

            // We now have YYYY-MM-DDThh:mm:ss.s
            Debug.Assert(sourceIndex <= source.Length);
            if (sourceIndex == source.Length)
            {
                return true;
            }

            curByte = source[sourceIndex++];

            // TZD ['Z'|'+'|'-'] is valid at this point
            switch (curByte)
            {
                case JsonConstants.UtcOffsetToken:
                    parseData.OffsetToken = JsonConstants.UtcOffsetToken;
                    return sourceIndex == source.Length;
                case JsonConstants.Plus:
                case JsonConstants.Hyphen:
                    parseData.OffsetToken = curByte;
                    return ParseOffset(ref parseData, source.Slice(sourceIndex));
                default:
                    return false;
            }

            static bool ParseOffset(ref DateTimeParseData parseData, ReadOnlySpan<byte> offsetData)
            {
                // Parse the hours for the offset
                if (
                    offsetData.Length < 2
                    || !TryGetNextTwoDigits(offsetData.Slice(0, 2), ref parseData.OffsetHours)
                )
                {
                    return false;
                }

                // We now have YYYY-MM-DDThh:mm:ss.s+|-hh

                if (offsetData.Length == 2)
                {
                    // Just hours offset specified
                    return true;
                }

                // Ensure we have enough for ":mm"
                return offsetData.Length == 5
                    && offsetData[2] == JsonConstants.Colon
                    && TryGetNextTwoDigits(offsetData.Slice(3), ref parseData.OffsetMinutes);
            }
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        // ReSharper disable once RedundantAssignment
        private static bool TryGetNextTwoDigits(ReadOnlySpan<byte> source, ref int value)
        {
            Debug.Assert(source.Length == 2);

            uint digit1 = source[0] - (uint)'0';
            uint digit2 = source[1] - (uint)'0';

            if (digit1 > 9 || digit2 > 9)
            {
                value = 0;
                return false;
            }

            value = (int)(digit1 * 10 + digit2);
            return true;
        }

        // The following methods are borrowed verbatim from src/Common/src/CoreLib/System/Buffers/Text/Utf8Parser/Utf8Parser.Date.Helpers.cs

        /// <summary>
        /// Overflow-safe DateTime factory.
        /// </summary>
        private static bool TryCreateDateTime(
            DateTimeParseData parseData,
            DateTimeKind kind,
            out DateTime value
        )
        {
            if (parseData.Year == 0)
            {
                value = default;
                return false;
            }

            Debug.Assert(parseData.Year <= 9999); // All of our callers to date parse the year from fixed 4-digit fields so this value is trusted.

            if ((uint)parseData.Month - 1 >= 12)
            {
                value = default;
                return false;
            }

            uint dayMinusOne = (uint)parseData.Day - 1;
            if (
                dayMinusOne >= 28
                && dayMinusOne >= DateTime.DaysInMonth(parseData.Year, parseData.Month)
            )
            {
                value = default;
                return false;
            }

            if ((uint)parseData.Hour > 23)
            {
                value = default;
                return false;
            }

            if ((uint)parseData.Minute > 59)
            {
                value = default;
                return false;
            }

            // This needs to allow leap seconds when appropriate.
            // See https://github.com/dotnet/runtime/issues/30135.
            if ((uint)parseData.Second > 59)
            {
                value = default;
                return false;
            }

            Debug.Assert(parseData.Fraction is >= 0 and <= JsonConstants.MaxDateTimeFraction); // All of our callers to date parse the fraction from fixed 7-digit fields so this value is trusted.

            ReadOnlySpan<int> days = DateTime.IsLeapYear(parseData.Year)
                ? DaysToMonth366
                : DaysToMonth365;
            int yearMinusOne = parseData.Year - 1;
            int totalDays =
                yearMinusOne * 365
                + yearMinusOne / 4
                - yearMinusOne / 100
                + yearMinusOne / 400
                + days[parseData.Month - 1]
                + parseData.Day
                - 1;
            long ticks = totalDays * TimeSpan.TicksPerDay;
            int totalSeconds = parseData.Hour * 3600 + parseData.Minute * 60 + parseData.Second;
            ticks += totalSeconds * TimeSpan.TicksPerSecond;
            ticks += parseData.Fraction;
            value = new DateTime(ticks: ticks, kind: kind);
            return true;
        }

        private static ReadOnlySpan<int> DaysToMonth365 =>
            [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365];
        private static ReadOnlySpan<int> DaysToMonth366 =>
            [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335, 366];
    }

    internal static class ThrowHelper
    {
        private const string ExceptionSourceValueToRethrowAsJsonException =
            "System.Text.Json.Rethrowable";

        [DoesNotReturn]
        public static void ThrowInvalidOperationException_ExpectedString(JsonTokenType tokenType)
        {
            throw GetInvalidOperationException("string", tokenType);
        }

        public static void ThrowFormatException(DataType dataType)
        {
            throw new FormatException(SR.Format(SR.UnsupportedFormat, dataType))
            {
                Source = ExceptionSourceValueToRethrowAsJsonException,
            };
        }

        private static global::System.Exception GetInvalidOperationException(
            string message,
            JsonTokenType tokenType
        )
        {
            return GetInvalidOperationException(SR.Format(SR.InvalidCast, tokenType, message));
        }

        private static InvalidOperationException GetInvalidOperationException(string message)
        {
            return new InvalidOperationException(message)
            {
                Source = ExceptionSourceValueToRethrowAsJsonException,
            };
        }
    }

    internal static class Utf8JsonReaderExtensions
    {
        internal static int ValueLength(this Utf8JsonReader reader) =>
            reader.HasValueSequence
                ? checked((int)reader.ValueSequence.Length)
                : reader.ValueSpan.Length;
    }

    internal enum DataType
    {
        TimeOnly,
        DateOnly,
    }

    [SuppressMessage("ReSharper", "InconsistentNaming")]
    internal static class SR
    {
        private static readonly bool s_usingResourceKeys =
            AppContext.TryGetSwitch(
                "System.Resources.UseSystemResourceKeys",
                out bool usingResourceKeys
            ) && usingResourceKeys;

        public static string UnsupportedFormat => Strings.UnsupportedFormat;

        public static string InvalidCast => Strings.InvalidCast;

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        internal static string Format(string resourceFormat, object? p1) =>
            s_usingResourceKeys
                ? string.Join(", ", resourceFormat, p1)
                : string.Format(resourceFormat, p1);

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        internal static string Format(string resourceFormat, object? p1, object? p2) =>
            s_usingResourceKeys
                ? string.Join(", ", resourceFormat, p1, p2)
                : string.Format(resourceFormat, p1, p2);
    }

    /// <summary>
    ///   A strongly-typed resource class, for looking up localized strings, etc.
    /// </summary>
    // This class was auto-generated by the StronglyTypedResourceBuilder
    // class via a tool like ResGen or Visual Studio.
    // To add or remove a member, edit your .ResX file then rerun ResGen
    // with the /str option, or rebuild your VS project.
    [global::System.CodeDom.Compiler.GeneratedCodeAttribute(
        "System.Resources.Tools.StronglyTypedResourceBuilder",
        "17.0.0.0"
    )]
    [global::System.Diagnostics.DebuggerNonUserCodeAttribute()]
    [global::System.Runtime.CompilerServices.CompilerGeneratedAttribute()]
    internal class Strings
    {
        private static global::System.Resources.ResourceManager resourceMan;

        private static global::System.Globalization.CultureInfo resourceCulture;

        [global::System.Diagnostics.CodeAnalysis.SuppressMessageAttribute(
            "Microsoft.Performance",
            "CA1811:AvoidUncalledPrivateCode"
        )]
        internal Strings() { }

        /// <summary>
        ///   Returns the cached ResourceManager instance used by this class.
        /// </summary>
        [global::System.ComponentModel.EditorBrowsableAttribute(
            global::System.ComponentModel.EditorBrowsableState.Advanced
        )]
        internal static global::System.Resources.ResourceManager ResourceManager
        {
            get
            {
                if (object.ReferenceEquals(resourceMan, null))
                {
                    global::System.Resources.ResourceManager temp =
                        new global::System.Resources.ResourceManager(
                            "System.Text.Json.Resources.Strings",
                            typeof(Strings).Assembly
                        );
                    resourceMan = temp;
                }
                return resourceMan;
            }
        }

        /// <summary>
        ///   Overrides the current thread's CurrentUICulture property for all
        ///   resource lookups using this strongly typed resource class.
        /// </summary>
        [global::System.ComponentModel.EditorBrowsableAttribute(
            global::System.ComponentModel.EditorBrowsableState.Advanced
        )]
        internal static global::System.Globalization.CultureInfo Culture
        {
            get { return resourceCulture; }
            set { resourceCulture = value; }
        }

        /// <summary>
        ///   Looks up a localized string similar to Cannot get the value of a token type &apos;{0}&apos; as a {1}..
        /// </summary>
        internal static string InvalidCast
        {
            get { return ResourceManager.GetString("InvalidCast", resourceCulture); }
        }

        /// <summary>
        ///   Looks up a localized string similar to The JSON value is not in a supported {0} format..
        /// </summary>
        internal static string UnsupportedFormat
        {
            get { return ResourceManager.GetString("UnsupportedFormat", resourceCulture); }
        }
    }
}
