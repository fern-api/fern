package com.fern.java.utils;

import com.fern.ir.model.commons.Name;
import com.fern.ir.model.commons.NameAndWireValue;
import com.fern.ir.model.commons.NameAndWireValueOrString;
import com.fern.ir.model.commons.NameOrString;

/**
 * Utility methods for extracting {@link Name} and {@link NameAndWireValue} from their v66 union wrappers
 * ({@link NameOrString} and {@link NameAndWireValueOrString}).
 *
 * <p>The custom deserializers ({@link NameDeserializer}, {@link NameAndWireValueDeserializer}) guarantee that the
 * string variant is always expanded into the full object form during IR deserialization, so these methods can safely
 * extract the object variant.
 */
public final class NameUtils {

    private static final NameOrString.Visitor<Name> NAME_EXTRACTOR = new NameOrString.Visitor<>() {
        @Override
        public Name visit(Name name) {
            return name;
        }

        @Override
        public Name visit(String string) {
            throw new IllegalStateException(
                    "NameOrString should have been deserialized to Name variant, got string: " + string);
        }
    };

    private static final NameAndWireValueOrString.Visitor<NameAndWireValue> NAWV_EXTRACTOR =
            new NameAndWireValueOrString.Visitor<>() {
                @Override
                public NameAndWireValue visit(NameAndWireValue nameAndWireValue) {
                    return nameAndWireValue;
                }

                @Override
                public NameAndWireValue visit(String string) {
                    throw new IllegalStateException(
                            "NameAndWireValueOrString should have been deserialized to NameAndWireValue variant, got string: "
                                    + string);
                }
            };

    private NameUtils() {}

    public static Name toName(NameOrString nameOrString) {
        return nameOrString.visit(NAME_EXTRACTOR);
    }

    public static NameAndWireValue toNameAndWireValue(NameAndWireValueOrString value) {
        return value.visit(NAWV_EXTRACTOR);
    }

    public static String getWireValue(NameAndWireValueOrString value) {
        return toNameAndWireValue(value).getWireValue();
    }

    public static Name getName(NameAndWireValueOrString value) {
        return toName(toNameAndWireValue(value).getName());
    }
}
