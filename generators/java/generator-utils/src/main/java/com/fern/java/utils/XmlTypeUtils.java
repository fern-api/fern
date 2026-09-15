package com.fern.java.utils;

import com.fern.ir.model.commons.TypeId;
import com.fern.ir.model.ir.IntermediateRepresentation;
import com.fern.ir.model.types.ContainerType;
import com.fern.ir.model.types.Encoding;
import com.fern.ir.model.types.ObjectProperty;
import com.fern.ir.model.types.TypeDeclaration;
import com.fern.ir.model.types.TypeReference;
import com.fern.ir.model.types.UndiscriminatedUnionMember;
import com.fern.ir.model.types.UndiscriminatedUnionTypeDeclaration;
import com.fern.ir.model.types.XmlEncoding;
import com.fern.ir.model.types.XmlPropertyEncoding;
import com.fern.ir.model.types.XmlPropertyKind;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

/** Helpers for inspecting the IR's xml encoding metadata. */
public final class XmlTypeUtils {

    private XmlTypeUtils() {}

    public static boolean hasXmlTypes(IntermediateRepresentation ir) {
        return ir.getTypes().values().stream()
                .anyMatch(typeDeclaration -> getXmlEncoding(typeDeclaration).isPresent());
    }

    public static Optional<XmlEncoding> getXmlEncoding(TypeDeclaration typeDeclaration) {
        return typeDeclaration.getEncoding().flatMap(Encoding::getXml);
    }

    /** Returns the xml encoding of the type if it is an object type serialized as an xml element. */
    public static Optional<XmlEncoding> getXmlObjectEncoding(
            Map<TypeId, TypeDeclaration> typeDeclarations, TypeId typeId) {
        TypeDeclaration typeDeclaration = typeDeclarations.get(typeId);
        if (typeDeclaration == null || !typeDeclaration.getShape().isObject()) {
            return Optional.empty();
        }
        return getXmlEncoding(typeDeclaration);
    }

    /** An undiscriminated union is an xml union when every member is an xml element (object or nested xml union). */
    public static boolean isXmlUnion(
            Map<TypeId, TypeDeclaration> typeDeclarations, UndiscriminatedUnionTypeDeclaration union) {
        return !union.getMembers().isEmpty()
                && union.getMembers().stream()
                        .map(UndiscriminatedUnionMember::getType)
                        .allMatch(type -> isXmlElementType(typeDeclarations, type, new HashSet<>()));
    }

    /** Whether values of this type serialize as xml elements (as opposed to scalar text). */
    public static boolean isXmlElementType(Map<TypeId, TypeDeclaration> typeDeclarations, TypeReference type) {
        return isXmlElementType(typeDeclarations, type, new HashSet<>());
    }

    private static boolean isXmlElementType(
            Map<TypeId, TypeDeclaration> typeDeclarations, TypeReference type, Set<TypeId> visited) {
        Optional<TypeId> typeId = type.getNamed().map(named -> named.getTypeId());
        if (typeId.isEmpty()) {
            return false;
        }
        if (!visited.add(typeId.get())) {
            // a type reached again along the current path is a cycle; let the other members decide
            return true;
        }
        TypeDeclaration typeDeclaration = typeDeclarations.get(typeId.get());
        if (typeDeclaration == null) {
            visited.remove(typeId.get());
            return false;
        }
        try {
            if (typeDeclaration.getShape().isObject()) {
                return getXmlEncoding(typeDeclaration).isPresent();
            }
            Optional<UndiscriminatedUnionTypeDeclaration> union =
                    typeDeclaration.getShape().getUndiscriminatedUnion();
            if (union.isPresent()) {
                return !union.get().getMembers().isEmpty()
                        && union.get().getMembers().stream()
                                .allMatch(member -> isXmlElementType(typeDeclarations, member.getType(), visited));
            }
            return false;
        } finally {
            visited.remove(typeId.get());
        }
    }

    /** The element names that values of this type can appear as. Empty for scalar types. */
    public static List<String> getElementNames(Map<TypeId, TypeDeclaration> typeDeclarations, TypeReference type) {
        List<String> names = new ArrayList<>();
        collectElementNames(typeDeclarations, type, names, new HashSet<>());
        return names;
    }

    private static void collectElementNames(
            Map<TypeId, TypeDeclaration> typeDeclarations,
            TypeReference type,
            List<String> names,
            Set<TypeId> visited) {
        Optional<TypeId> typeId = type.getNamed().map(named -> named.getTypeId());
        if (typeId.isEmpty() || !visited.add(typeId.get())) {
            return;
        }
        TypeDeclaration typeDeclaration = typeDeclarations.get(typeId.get());
        if (typeDeclaration == null) {
            return;
        }
        Optional<XmlEncoding> xmlEncoding = getXmlEncoding(typeDeclaration);
        if (typeDeclaration.getShape().isObject() && xmlEncoding.isPresent()) {
            if (!names.contains(xmlEncoding.get().getName())) {
                names.add(xmlEncoding.get().getName());
            }
            return;
        }
        typeDeclaration.getShape().getUndiscriminatedUnion().ifPresent(union -> union.getMembers()
                .forEach(member -> collectElementNames(typeDeclarations, member.getType(), names, visited)));
    }

    /** Strips optional/nullable wrappers. */
    public static TypeReference unwrapOptional(TypeReference type) {
        Optional<ContainerType> container = type.getContainer();
        if (container.isPresent()) {
            Optional<TypeReference> inner = container.get().getOptional();
            if (inner.isEmpty()) {
                inner = container.get().getNullable();
            }
            if (inner.isPresent()) {
                return unwrapOptional(inner.get());
            }
        }
        return type;
    }

    public static boolean isOptional(TypeReference type) {
        return type.getContainer()
                .map(container -> container.isOptional() || container.isNullable())
                .orElse(false);
    }

    /** Returns the item type if the (already unwrapped) type is a list or set. */
    public static Optional<TypeReference> getListItemType(TypeReference type) {
        Optional<ContainerType> container = type.getContainer();
        if (container.isEmpty()) {
            return Optional.empty();
        }
        Optional<TypeReference> list = container.get().getList();
        return list.isPresent() ? list : container.get().getSet();
    }

    public static XmlPropertyKind getPropertyKind(ObjectProperty property) {
        return property.getXml().map(XmlPropertyEncoding::getKind).orElse(XmlPropertyKind.ELEMENT);
    }

    /** A root element is an xml object that no other xml object references as a child element. */
    public static boolean isRootElement(Map<TypeId, TypeDeclaration> typeDeclarations, TypeId typeId) {
        for (TypeDeclaration typeDeclaration : typeDeclarations.values()) {
            if (getXmlEncoding(typeDeclaration).isEmpty()
                    || typeDeclaration.getShape().getObject().isEmpty()) {
                continue;
            }
            for (ObjectProperty property :
                    typeDeclaration.getShape().getObject().get().getProperties()) {
                if (getPropertyKind(property).equals(XmlPropertyKind.ELEMENT)
                        && referencesType(typeDeclarations, property.getValueType(), typeId, new HashSet<>())) {
                    return false;
                }
            }
        }
        return true;
    }

    private static boolean referencesType(
            Map<TypeId, TypeDeclaration> typeDeclarations, TypeReference type, TypeId target, Set<TypeId> visited) {
        Optional<ContainerType> container = type.getContainer();
        if (container.isPresent()) {
            TypeReference unwrapped = unwrapOptional(type);
            Optional<TypeReference> item = getListItemType(unwrapped);
            TypeReference inner = item.orElse(unwrapped);
            if (inner.equals(type)) {
                return false;
            }
            return referencesType(typeDeclarations, inner, target, visited);
        }
        Optional<TypeId> typeId = type.getNamed().map(named -> named.getTypeId());
        if (typeId.isEmpty() || !visited.add(typeId.get())) {
            return false;
        }
        if (typeId.get().equals(target)) {
            return true;
        }
        TypeDeclaration typeDeclaration = typeDeclarations.get(typeId.get());
        if (typeDeclaration == null) {
            return false;
        }
        List<UndiscriminatedUnionMember> members = typeDeclaration
                .getShape()
                .getUndiscriminatedUnion()
                .map(UndiscriminatedUnionTypeDeclaration::getMembers)
                .orElse(Collections.emptyList());
        return members.stream().anyMatch(member -> referencesType(typeDeclarations, member.getType(), target, visited));
    }
}
