package com.fern.java.generators.object;

import com.fern.ir.model.commons.TypeId;
import com.fern.ir.model.types.ObjectProperty;
import com.fern.ir.model.types.TypeDeclaration;
import com.fern.ir.model.types.TypeReference;
import com.fern.ir.model.types.XmlEncoding;
import com.fern.ir.model.types.XmlPropertyEncoding;
import com.fern.ir.model.types.XmlPropertyKind;
import com.fern.java.AbstractGeneratorContext;
import com.fern.java.generators.XmlCoreGenerator;
import com.fern.java.utils.KeyWordUtils;
import com.fern.java.utils.NameUtils;
import com.fern.java.utils.XmlTypeUtils;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.CodeBlock;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterizedTypeName;
import com.squareup.javapoet.TypeName;
import com.squareup.javapoet.TypeSpec;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import javax.lang.model.element.Modifier;
import org.w3c.dom.Element;

/**
 * Adds xml support to a generated object type: {@code toXml()}, a static {@code fromXml(...)} factory, and builder
 * methods that append typed child elements.
 */
public final class XmlObjectMethodsGenerator {

    public static final String TO_XML_METHOD_NAME = "toXml";
    public static final String FROM_XML_METHOD_NAME = "fromXml";

    private static final String WRITER_VARIABLE = "writer";
    private static final String ELEMENT_VARIABLE = "element";
    private static final String XML_DECLARATION_PARAMETER = "xmlDeclaration";
    private static final String DEFAULT_LIST_SEPARATOR = " ";
    private static final String BUILDER_CLASS_NAME = "Builder";
    private static final String FINAL_STAGE_INTERFACE_NAME = "_FinalStage";
    private static final ClassName JACKSON_TYPE_REFERENCE =
            ClassName.get("com.fasterxml.jackson.core.type", "TypeReference");

    private final AbstractGeneratorContext<?, ?> generatorContext;
    private final Map<TypeId, TypeDeclaration> typeDeclarations;
    private final ClassName objectClassName;
    private final XmlEncoding xmlEncoding;
    private final boolean isRoot;
    private final List<EnrichedObjectProperty> properties;
    private final Optional<String> additionalPropertiesFieldName;
    private final ClassName xmlWriterClassName;
    private final ClassName xmlReaderClassName;
    private final ClassName xmlSerializableClassName;

    public XmlObjectMethodsGenerator(
            AbstractGeneratorContext<?, ?> generatorContext,
            ClassName objectClassName,
            TypeId typeId,
            XmlEncoding xmlEncoding,
            List<EnrichedObjectProperty> properties,
            Optional<String> additionalPropertiesFieldName) {
        this.generatorContext = generatorContext;
        this.typeDeclarations = generatorContext.getTypeDeclarations();
        this.objectClassName = objectClassName;
        this.xmlEncoding = xmlEncoding;
        this.isRoot = XmlTypeUtils.isRootElement(typeDeclarations, typeId);
        this.properties = properties.stream()
                .filter(property -> property.fieldSpec().isPresent())
                .collect(Collectors.toList());
        this.additionalPropertiesFieldName = additionalPropertiesFieldName;
        this.xmlWriterClassName = XmlCoreGenerator.getXmlWriterClassName(generatorContext);
        this.xmlReaderClassName = XmlCoreGenerator.getXmlReaderClassName(generatorContext);
        this.xmlSerializableClassName = XmlCoreGenerator.getXmlSerializableClassName(generatorContext);
    }

    public TypeSpec addXmlSupport(TypeSpec typeSpec) {
        TypeSpec.Builder builder = typeSpec.toBuilder()
                .addSuperinterface(xmlSerializableClassName)
                .addMethod(generateToXml())
                .addMethod(generateToXmlWithDeclaration());
        findFieldConstructor(typeSpec).ifPresent(constructor -> builder.addMethod(generateFromXmlString())
                .addMethod(generateFromXmlElement(constructor)));
        List<MethodSpec> childBuilderMethods = generateChildBuilderMethods(typeSpec);
        if (childBuilderMethods.isEmpty()) {
            return builder.build();
        }
        boolean hasFinalStage =
                typeSpec.typeSpecs.stream().anyMatch(nested -> nested.name.equals(FINAL_STAGE_INTERFACE_NAME));
        builder.typeSpecs.clear();
        for (TypeSpec nested : typeSpec.typeSpecs) {
            builder.addType(withChildBuilderMethods(nested, childBuilderMethods, hasFinalStage));
        }
        return builder.build();
    }

    /**
     * The constructor taking one parameter per field, in field order (very large objects instead use a builder-based
     * constructor, which {@code fromXml} does not support).
     */
    private Optional<MethodSpec> findFieldConstructor(TypeSpec typeSpec) {
        List<String> expectedParameters =
                properties.stream().map(p -> p.fieldSpec().get().name).collect(Collectors.toList());
        additionalPropertiesFieldName.ifPresent(expectedParameters::add);
        return typeSpec.methodSpecs.stream()
                .filter(MethodSpec::isConstructor)
                .filter(constructor -> constructor.parameters.stream()
                        .map(parameter -> parameter.name)
                        .collect(Collectors.toList())
                        .equals(expectedParameters))
                .findFirst();
    }

    private MethodSpec generateToXml() {
        return MethodSpec.methodBuilder(TO_XML_METHOD_NAME)
                .addAnnotation(Override.class)
                .addModifiers(Modifier.PUBLIC)
                .returns(String.class)
                .addStatement("return $L($L)", TO_XML_METHOD_NAME, isRoot)
                .build();
    }

    private MethodSpec generateToXmlWithDeclaration() {
        MethodSpec.Builder method = MethodSpec.methodBuilder(TO_XML_METHOD_NAME)
                .addAnnotation(Override.class)
                .addModifiers(Modifier.PUBLIC)
                .addParameter(boolean.class, XML_DECLARATION_PARAMETER)
                .returns(String.class);
        if (xmlEncoding.getNamespace().isPresent() || xmlEncoding.getPrefix().isPresent()) {
            method.addStatement(
                    "$T $L = new $T($S, $S, $S)",
                    xmlWriterClassName,
                    WRITER_VARIABLE,
                    xmlWriterClassName,
                    xmlEncoding.getName(),
                    xmlEncoding.getNamespace().orElse(null),
                    xmlEncoding.getPrefix().orElse(null));
        } else {
            method.addStatement(
                    "$T $L = new $T($S)",
                    xmlWriterClassName,
                    WRITER_VARIABLE,
                    xmlWriterClassName,
                    xmlEncoding.getName());
        }
        for (EnrichedObjectProperty property : properties) {
            method.addStatement(generateWriteProperty(property));
        }
        additionalPropertiesFieldName.ifPresent(
                fieldName -> method.addStatement("$L.attributes(this.$L)", WRITER_VARIABLE, fieldName));
        method.addStatement("return $L.toXml($L)", WRITER_VARIABLE, XML_DECLARATION_PARAMETER);
        return method.build();
    }

    private CodeBlock generateWriteProperty(EnrichedObjectProperty property) {
        PropertyShape shape = PropertyShape.of(property, typeDeclarations, generatorContext);
        String fieldName = property.fieldSpec().get().name;
        switch (shape.kind.getEnumValue()) {
            case ATTRIBUTE:
                return shape.listSeparator.isPresent()
                        ? CodeBlock.of(
                                "$L.attribute($S, this.$L, $S)",
                                WRITER_VARIABLE,
                                shape.xmlName,
                                fieldName,
                                shape.listSeparator.get())
                        : CodeBlock.of("$L.attribute($S, this.$L)", WRITER_VARIABLE, shape.xmlName, fieldName);
            case TEXT:
                return shape.listSeparator.isPresent()
                        ? CodeBlock.of("$L.text(this.$L, $S)", WRITER_VARIABLE, fieldName, shape.listSeparator.get())
                        : CodeBlock.of("$L.text(this.$L)", WRITER_VARIABLE, fieldName);
            case ELEMENT:
            default:
                return shape.wrapped
                        ? CodeBlock.of(
                                "$L.wrappedChildren($S, $S, this.$L)",
                                WRITER_VARIABLE,
                                shape.xmlName,
                                shape.itemElementName(),
                                fieldName)
                        : CodeBlock.of("$L.children($S, this.$L)", WRITER_VARIABLE, shape.xmlName, fieldName);
        }
    }

    private MethodSpec generateFromXmlString() {
        return MethodSpec.methodBuilder(FROM_XML_METHOD_NAME)
                .addJavadoc("Parses an xml document whose root element is <$L>.\n", xmlEncoding.getName())
                .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                .addParameter(String.class, "xml")
                .returns(objectClassName)
                .addStatement("return $L($T.parse(xml))", FROM_XML_METHOD_NAME, xmlReaderClassName)
                .build();
    }

    private MethodSpec generateFromXmlElement(MethodSpec constructor) {
        MethodSpec.Builder method = MethodSpec.methodBuilder(FROM_XML_METHOD_NAME)
                .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                .addParameter(Element.class, ELEMENT_VARIABLE)
                .returns(objectClassName)
                .addStatement("$T.expect($L, $S)", xmlReaderClassName, ELEMENT_VARIABLE, xmlEncoding.getName());
        List<CodeBlock> arguments = new ArrayList<>();
        List<String> attributeNames = new ArrayList<>();
        for (EnrichedObjectProperty property : properties) {
            PropertyShape shape = PropertyShape.of(property, typeDeclarations, generatorContext);
            if (shape.kind.getEnumValue() == XmlPropertyKind.Value.ATTRIBUTE) {
                attributeNames.add(shape.xmlName);
            }
            arguments.add(generateReadProperty(property, shape));
        }
        additionalPropertiesFieldName.ifPresent(fieldName -> arguments.add(CodeBlock.of(
                "$T.extraAttributes($L, $T.asList($L))",
                xmlReaderClassName,
                ELEMENT_VARIABLE,
                Arrays.class,
                attributeNames.stream().map(name -> CodeBlock.of("$S", name)).collect(CodeBlock.joining(", ")))));
        if (arguments.size() != constructor.parameters.size()) {
            throw new IllegalStateException("fromXml argument count " + arguments.size()
                    + " does not match constructor of " + objectClassName.simpleName());
        }
        method.addStatement("return new $T($L)", objectClassName, CodeBlock.join(arguments, ",\n"));
        return method.build();
    }

    private CodeBlock generateReadProperty(EnrichedObjectProperty property, PropertyShape shape) {
        TypeName fieldType = property.fieldSpec().get().type;
        boolean fieldIsOptional = fieldType instanceof ParameterizedTypeName
                && ((ParameterizedTypeName) fieldType).rawType.equals(ClassName.get(Optional.class));
        CodeBlock value;
        switch (shape.kind.getEnumValue()) {
            case ATTRIBUTE:
                value = readScalarSource(
                        CodeBlock.of("$T.attribute($L, $S)", xmlReaderClassName, ELEMENT_VARIABLE, shape.xmlName),
                        shape,
                        "attribute \"" + shape.xmlName + "\"");
                break;
            case TEXT:
                value = readScalarSource(
                        CodeBlock.of("$T.text($L)", xmlReaderClassName, ELEMENT_VARIABLE), shape, "text content");
                break;
            case ELEMENT:
            default:
                value = readChildElements(shape);
                break;
        }
        if (shape.optional && !fieldIsOptional) {
            return CodeBlock.of("$L.orElse(null)", value);
        }
        return value;
    }

    private CodeBlock readScalarSource(CodeBlock source, PropertyShape shape, String description) {
        CodeBlock converter = shape.stringConverter(xmlReaderClassName);
        if (shape.list) {
            CodeBlock items = converter.isEmpty()
                    ? CodeBlock.of(
                            "$T.split(v, $S)", xmlReaderClassName, shape.listSeparator.orElse(DEFAULT_LIST_SEPARATOR))
                    : CodeBlock.of(
                            "$T.split(v, $S).stream().map($L).collect($T.toList())",
                            xmlReaderClassName,
                            shape.listSeparator.orElse(DEFAULT_LIST_SEPARATOR),
                            converter,
                            Collectors.class);
            CodeBlock parsed = CodeBlock.of("$L.map(v -> $L)", source, items);
            return shape.optional ? parsed : CodeBlock.of("$L.orElseGet($T::emptyList)", parsed, Collections.class);
        }
        CodeBlock parsed = converter.isEmpty() ? source : CodeBlock.of("$L.map($L)", source, converter);
        return shape.optional ? parsed : required(parsed, xmlEncoding.getName(), description);
    }

    private CodeBlock readChildElements(PropertyShape shape) {
        CodeBlock names = shape.elementNames().stream()
                .map(name -> CodeBlock.of("$S", name))
                .collect(CodeBlock.joining(", "));
        CodeBlock elements = shape.wrapped
                ? CodeBlock.of(
                        "$T.wrappedChildren($L, $S, $L)", xmlReaderClassName, ELEMENT_VARIABLE, shape.xmlName, names)
                : CodeBlock.of("$T.children($L, $L)", xmlReaderClassName, ELEMENT_VARIABLE, names);
        CodeBlock converter;
        if (shape.itemIsElement) {
            converter = CodeBlock.of("$T::$L", shape.itemTypeName, FROM_XML_METHOD_NAME);
        } else {
            CodeBlock text =
                    required(CodeBlock.of("$T.text(e)", xmlReaderClassName), shape.itemElementName(), "text content");
            CodeBlock stringConverter = shape.stringConverter(xmlReaderClassName);
            converter = stringConverter.isEmpty()
                    ? CodeBlock.of("e -> $L", text)
                    : CodeBlock.of("e -> $T.convert($L, $L)", xmlReaderClassName, text, shape.converterTarget());
        }
        if (shape.list) {
            CodeBlock list =
                    CodeBlock.of("$L.stream().map($L).collect($T.toList())", elements, converter, Collectors.class);
            if (!shape.optional) {
                return list;
            }
            return shape.wrapped
                    ? CodeBlock.of(
                            "$T.optionalWrappedList($L, $S, $L)",
                            xmlReaderClassName,
                            ELEMENT_VARIABLE,
                            shape.xmlName,
                            list)
                    : CodeBlock.of("$T.optionalList($L)", xmlReaderClassName, list);
        }
        CodeBlock first = CodeBlock.of("$L.stream().findFirst().map($L)", elements, converter);
        return shape.optional
                ? first
                : required(first, xmlEncoding.getName(), "<" + shape.itemElementName() + "> element");
    }

    private CodeBlock required(CodeBlock optionalValue, String elementName, String description) {
        return CodeBlock.of("$T.required($L, $S, $S)", xmlReaderClassName, optionalValue, elementName, description);
    }

    private List<MethodSpec> generateChildBuilderMethods(TypeSpec typeSpec) {
        Optional<TypeSpec> builderSpec = typeSpec.typeSpecs.stream()
                .filter(nested -> nested.name.equals(BUILDER_CLASS_NAME))
                .findFirst();
        if (builderSpec.isEmpty()) {
            return Collections.emptyList();
        }
        Set<String> takenNames = new HashSet<>();
        typeSpec.typeSpecs.forEach(nested -> nested.methodSpecs.forEach(method -> takenNames.add(method.name)));
        List<MethodSpec> methods = new ArrayList<>();
        for (EnrichedObjectProperty property : properties) {
            PropertyShape shape = PropertyShape.of(property, typeDeclarations, generatorContext);
            if (shape.kind.getEnumValue() != XmlPropertyKind.Value.ELEMENT || !shape.list || !shape.itemIsElement) {
                continue;
            }
            String fieldName = property.fieldSpec().get().name;
            for (ChildVariant variant : shape.childVariants()) {
                String methodName = KeyWordUtils.getKeyWordCompatibleMethodName(variant.camelCaseName);
                for (int suffix = 1; !takenNames.add(methodName); suffix++) {
                    methodName = "add" + variant.pascalCaseName + (suffix == 1 ? "" : suffix);
                }
                CodeBlock item = variant.isUnionMember
                        ? CodeBlock.of("$T.of($L)", shape.itemTypeName, variant.parameterName)
                        : CodeBlock.of("$L", variant.parameterName);
                MethodSpec.Builder method = MethodSpec.methodBuilder(methodName)
                        .addJavadoc("Appends a <$L> child element.\n", variant.elementName)
                        .addModifiers(Modifier.PUBLIC)
                        .addParameter(variant.typeName, variant.parameterName)
                        .returns(objectClassName.nestedClass(BUILDER_CLASS_NAME));
                if (shape.optional) {
                    method.addStatement(
                                    "$T<$T> updated = new $T<>(this.$L.orElseGet($T::emptyList))",
                                    List.class,
                                    shape.itemTypeName,
                                    ArrayList.class,
                                    fieldName,
                                    Collections.class)
                            .addStatement("updated.add($L)", item)
                            .addStatement("this.$L = $T.of(updated)", fieldName, Optional.class);
                } else {
                    method.addStatement("this.$L.add($L)", fieldName, item);
                }
                methods.add(method.addStatement("return this").build());
            }
        }
        return methods;
    }

    private static TypeSpec withChildBuilderMethods(TypeSpec nested, List<MethodSpec> methods, boolean hasFinalStage) {
        if (nested.name.equals(BUILDER_CLASS_NAME)) {
            if (!hasFinalStage) {
                return nested.toBuilder().addMethods(methods).build();
            }
            return nested.toBuilder()
                    .addMethods(methods.stream()
                            .map(method -> method.toBuilder()
                                    .addAnnotation(Override.class)
                                    .build())
                            .collect(Collectors.toList()))
                    .build();
        }
        if (nested.name.equals(FINAL_STAGE_INTERFACE_NAME)) {
            return nested.toBuilder()
                    .addMethods(methods.stream()
                            .map(method -> MethodSpec.methodBuilder(method.name)
                                    .addJavadoc(method.javadoc)
                                    .addModifiers(Modifier.PUBLIC, Modifier.ABSTRACT)
                                    .addParameters(method.parameters)
                                    .returns(method.returnType)
                                    .build())
                            .collect(Collectors.toList()))
                    .build();
        }
        return nested;
    }

    private static final class ChildVariant {
        private final TypeName typeName;
        private final String elementName;
        private final String camelCaseName;
        private final String pascalCaseName;
        private final String parameterName;
        private final boolean isUnionMember;

        private ChildVariant(
                TypeName typeName, String elementName, TypeDeclaration declaration, boolean isUnionMember) {
            this.typeName = typeName;
            this.elementName = elementName;
            this.camelCaseName = NameUtils.toName(declaration.getName().getName())
                    .getCamelCase()
                    .getSafeName();
            this.pascalCaseName = NameUtils.toName(declaration.getName().getName())
                    .getPascalCase()
                    .getSafeName();
            this.parameterName = KeyWordUtils.getKeyWordCompatibleName(
                    NameUtils.toName(declaration.getName().getName())
                            .getCamelCase()
                            .getUnsafeName());
            this.isUnionMember = isUnionMember;
        }
    }

    private static final class PropertyShape {
        private final XmlPropertyKind kind;
        private final String xmlName;
        private final Optional<String> listSeparator;
        private final boolean wrapped;
        private final boolean optional;
        private final boolean list;
        private final TypeReference itemType;
        private final TypeName itemTypeName;
        private final boolean itemIsElement;
        private final Map<TypeId, TypeDeclaration> typeDeclarations;
        private final AbstractGeneratorContext<?, ?> generatorContext;

        private PropertyShape(
                EnrichedObjectProperty property,
                Map<TypeId, TypeDeclaration> typeDeclarations,
                AbstractGeneratorContext<?, ?> generatorContext) {
            ObjectProperty objectProperty = property.objectProperty();
            Optional<XmlPropertyEncoding> xml = objectProperty.getXml();
            this.typeDeclarations = typeDeclarations;
            this.generatorContext = generatorContext;
            this.kind = XmlTypeUtils.getPropertyKind(objectProperty);
            this.xmlName = xml.flatMap(XmlPropertyEncoding::getName)
                    .orElse(property.wireKey().orElse(property.camelCaseKey()));
            this.listSeparator = xml.flatMap(XmlPropertyEncoding::getListSeparator);
            this.wrapped = xml.flatMap(XmlPropertyEncoding::getWrapped).orElse(false);
            TypeReference valueType = objectProperty.getValueType();
            this.optional = XmlTypeUtils.isOptional(valueType);
            TypeReference unwrapped = XmlTypeUtils.unwrapOptional(valueType);
            Optional<TypeReference> listItem = XmlTypeUtils.getListItemType(unwrapped);
            this.list = listItem.isPresent();
            this.itemType = XmlTypeUtils.unwrapOptional(listItem.orElse(unwrapped));
            this.itemTypeName = generatorContext.getPoetTypeNameMapper().convertToTypeName(false, itemType);
            this.itemIsElement = XmlTypeUtils.isXmlElementType(typeDeclarations, itemType);
        }

        static PropertyShape of(
                EnrichedObjectProperty property,
                Map<TypeId, TypeDeclaration> typeDeclarations,
                AbstractGeneratorContext<?, ?> generatorContext) {
            return new PropertyShape(property, typeDeclarations, generatorContext);
        }

        List<String> elementNames() {
            if (!itemIsElement) {
                return Collections.singletonList(itemElementName());
            }
            return XmlTypeUtils.getElementNames(typeDeclarations, itemType);
        }

        /** The element name for a single child: the item's own xml name for element types, otherwise the property's. */
        String itemElementName() {
            if (itemIsElement) {
                List<String> names = XmlTypeUtils.getElementNames(typeDeclarations, itemType);
                if (names.size() == 1) {
                    return names.get(0);
                }
            }
            return xmlName;
        }

        /** A lambda or method reference converting a String to the item type, or an empty block for String items. */
        CodeBlock stringConverter(ClassName xmlReaderClassName) {
            if (itemTypeName.equals(ClassName.get(String.class))) {
                return CodeBlock.of("");
            }
            return CodeBlock.of("v -> $T.convert(v, $L)", xmlReaderClassName, converterTarget());
        }

        CodeBlock converterTarget() {
            TypeName boxed = itemTypeName.box();
            if (boxed instanceof ClassName) {
                return CodeBlock.of("$T.class", boxed);
            }
            return CodeBlock.of("new $T<$T>() {}", JACKSON_TYPE_REFERENCE, boxed);
        }

        List<ChildVariant> childVariants() {
            List<ChildVariant> variants = new ArrayList<>();
            Optional<TypeId> typeId = itemType.getNamed().map(named -> named.getTypeId());
            if (typeId.isEmpty()) {
                return variants;
            }
            TypeDeclaration declaration = typeDeclarations.get(typeId.get());
            if (declaration == null) {
                return variants;
            }
            Optional<XmlEncoding> xml = XmlTypeUtils.getXmlObjectEncoding(typeDeclarations, typeId.get());
            if (xml.isPresent()) {
                variants.add(new ChildVariant(itemTypeName, xml.get().getName(), declaration, false));
                return variants;
            }
            declaration.getShape().getUndiscriminatedUnion().ifPresent(union -> union.getMembers()
                    .forEach(member -> {
                        Optional<TypeId> memberTypeId =
                                member.getType().getNamed().map(named -> named.getTypeId());
                        if (memberTypeId.isEmpty()) {
                            return;
                        }
                        Optional<XmlEncoding> memberXml =
                                XmlTypeUtils.getXmlObjectEncoding(typeDeclarations, memberTypeId.get());
                        TypeDeclaration memberDeclaration = typeDeclarations.get(memberTypeId.get());
                        if (memberXml.isEmpty() || memberDeclaration == null) {
                            return;
                        }
                        TypeName memberTypeName =
                                generatorContext.getPoetTypeNameMapper().convertToTypeName(false, member.getType());
                        variants.add(
                                new ChildVariant(memberTypeName, memberXml.get().getName(), memberDeclaration, true));
                    }));
            return variants;
        }
    }
}
