package com.fern.java.utils;

import com.fern.ir.model.commons.Name;
import com.fern.ir.model.commons.NameAndWireValue;
import com.fern.ir.model.commons.NameAndWireValueOrString;
import com.fern.ir.model.commons.NameOrString;
import com.fern.ir.model.commons.SafeAndUnsafeString;

/**
 * Utility methods for resolving IR v66 {@link NameOrString} and {@link NameAndWireValueOrString} union types into their
 * fully-typed counterparts.
 *
 * <p>IR v66 compresses {@link Name} into {@link NameOrString} (which can be a plain string or a full {@link Name}
 * object) and {@link NameAndWireValue} into {@link NameAndWireValueOrString}. These helpers provide a uniform way to
 * extract the typed values, building synthetic {@link Name}/{@link NameAndWireValue} objects from plain strings when
 * necessary.
 */
public final class NameUtils {

    private NameUtils() {}

    /**
     * Resolves a {@link NameOrString} into a {@link Name}. If the value is already a {@link Name}, returns it directly.
     * If it is a plain string, constructs a synthetic {@link Name} using the string for all casing variants.
     */
    public static Name resolveName(NameOrString nameOrString) {
        return nameOrString.visit(new NameOrString.Visitor<Name>() {
            @Override
            public Name visit(String value) {
                SafeAndUnsafeString safeAndUnsafe = SafeAndUnsafeString.builder()
                        .unsafeName(value)
                        .safeName(value)
                        .build();
                return Name.builder()
                        .originalName(value)
                        .camelCase(safeAndUnsafe)
                        .pascalCase(safeAndUnsafe)
                        .snakeCase(safeAndUnsafe)
                        .screamingSnakeCase(safeAndUnsafe)
                        .build();
            }

            @Override
            public Name visit(Name value) {
                return value;
            }
        });
    }

    /**
     * Resolves a {@link NameAndWireValueOrString} into a {@link NameAndWireValue}. If the value is already a
     * {@link NameAndWireValue}, returns it directly. If it is a plain string, constructs a synthetic
     * {@link NameAndWireValue} using the string as both the wire value and all name casing variants.
     */
    public static NameAndWireValue resolveNameAndWireValue(NameAndWireValueOrString nameAndWireValueOrString) {
        return nameAndWireValueOrString.visit(new NameAndWireValueOrString.Visitor<NameAndWireValue>() {
            @Override
            public NameAndWireValue visit(String value) {
                return NameAndWireValue.builder()
                        .wireValue(value)
                        .name(NameOrString.of(resolveName(NameOrString.of(value))))
                        .build();
            }

            @Override
            public NameAndWireValue visit(NameAndWireValue value) {
                return value;
            }
        });
    }

    /**
     * Extracts the wire value from a {@link NameAndWireValueOrString}. If the value is a plain string, uses that string
     * directly. If it is a {@link NameAndWireValue}, returns its wire value.
     */
    public static String getWireValue(NameAndWireValueOrString nameAndWireValueOrString) {
        return nameAndWireValueOrString.visit(new NameAndWireValueOrString.Visitor<String>() {
            @Override
            public String visit(String value) {
                return value;
            }

            @Override
            public String visit(NameAndWireValue value) {
                return value.getWireValue();
            }
        });
    }

    /**
     * Extracts the {@link NameOrString} from a {@link NameAndWireValueOrString}. If the value is a plain string, wraps
     * it as a {@link NameOrString}. If it is a {@link NameAndWireValue}, returns its name field.
     */
    public static NameOrString getNameFromWireValue(NameAndWireValueOrString nameAndWireValueOrString) {
        return nameAndWireValueOrString.visit(new NameAndWireValueOrString.Visitor<NameOrString>() {
            @Override
            public NameOrString visit(String value) {
                return NameOrString.of(value);
            }

            @Override
            public NameOrString visit(NameAndWireValue value) {
                return value.getName();
            }
        });
    }
}
