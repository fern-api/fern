package com.fern.java.generators.object;

import com.fern.ir.model.commons.TypeId;
import com.fern.ir.model.types.ObjectProperty;
import com.fern.ir.model.types.ObjectTypeDeclaration;
import com.fern.ir.model.types.TypeDeclaration;
import com.fern.ir.model.types.TypeReference;
import com.fern.ir.model.types.XmlEncoding;
import com.fern.ir.model.types.XmlPropertyEncoding;
import com.fern.ir.model.types.XmlPropertyKind;
import com.fern.java.AbstractGeneratorContext;
import com.fern.java.generators.XmlCoreGenerator;
import com.fern.java.utils.JavaDocUtils;
import com.fern.java.utils.KeyWordUtils;
import com.fern.java.utils.NameUtils;
import com.fern.java.utils.XmlTypeUtils;
import com.squareup.javapoet.ArrayTypeName;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.CodeBlock;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterSpec;
import com.squareup.javapoet.ParameterizedTypeName;
import com.squareup.javapoet.TypeName;
import com.squareup.javapoet.TypeSpec;
import java.net.URI;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import javax.lang.model.element.Modifier;
import org.w3c.dom.Element;

/**
 * Adds xml support to a generated object type: {@code toXml()}, static {@code fromXml(...)} factories on the type and
 * on its {@code Builder}, and builder methods that append typed child elements.
 */
public final class XmlObjectMethodsGenerator {

    public static final String TO_XML_METHOD_NAME = "toXml";
    public static final String FROM_XML_METHOD_NAME = "fromXml";

    private static final String WRITER_VARIABLE = "writer";
    private static final String ELEMENT_VARIABLE = "element";
    private static final String CONTENT_VARIABLE = "content";
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
    private final Optional<String> typeDocs;
    private final List<EnrichedObjectProperty> properties;
    private final Map<String, String> propertyDocsByFieldName;
    private final Optional<String> additionalPropertiesFieldName;
    private final String contentFieldName;
    private final String contentGetterName;
    private final boolean hasTextProperty;
    private final boolean usesBuilderConstructor;
    private final ClassName builderClassName;
    private final ClassName xmlWriterClassName;
    private final ClassName xmlReaderClassName;
    private final ClassName xmlSerializableClassName;
    private final ClassName xmlNodeClassName;

    /** The uniform setter for an element's text content when its own name is taken by a child builder. */
    public static final String TEXT_FIELD_NAME = "text";

    /** The names the child builders of an xml object take: the camelCase name of each typed child element. */
    public static Set<String> childBuilderNames(
            Map<TypeId, TypeDeclaration> typeDeclarations, List<ObjectProperty> properties) {
        Set<String> names = new HashSet<>();
        for (ObjectProperty property : properties) {
            if (XmlTypeUtils.getPropertyKind(property).getEnumValue() != XmlPropertyKind.Value.ELEMENT) {
                continue;
            }
            Optional<TypeReference> item =
                    XmlTypeUtils.getListItemType(XmlTypeUtils.unwrapOptional(property.getValueType()));
            Optional<TypeId> typeId = item.flatMap(TypeReference::getNamed).map(named -> named.getTypeId());
            if (typeId.isEmpty()) {
                continue;
            }
            TypeDeclaration declaration = typeDeclarations.get(typeId.get());
            if (declaration == null) {
                continue;
            }
            if (XmlTypeUtils.getXmlObjectEncoding(typeDeclarations, typeId.get())
                    .isPresent()) {
                names.add(childBuilderName(declaration));
                continue;
            }
            declaration.getShape().getUndiscriminatedUnion().ifPresent(union -> union.getMembers()
                    .forEach(member -> member.getType()
                            .getNamed()
                            .map(named -> typeDeclarations.get(named.getTypeId()))
                            .filter(memberDeclaration -> memberDeclaration != null
                                    && XmlTypeUtils.getXmlObjectEncoding(
                                                    typeDeclarations,
                                                    memberDeclaration.getName().getTypeId())
                                            .isPresent())
                            .ifPresent(memberDeclaration -> names.add(childBuilderName(memberDeclaration)))));
        }
        return names;
    }

    private static String childBuilderName(TypeDeclaration declaration) {
        return KeyWordUtils.getKeyWordCompatibleMethodName(
                NameUtils.toName(declaration.getName().getName()).getCamelCase().getSafeName());
    }

    /**
     * The text property whose name is also a child builder's name ({@code Message.body} vs {@code <Body>}). As in the
     * legacy SDKs the child builder keeps the name, so the text property is generated as {@code text}.
     */
    public static Optional<ObjectProperty> textPropertyYieldingToChild(
            Map<TypeId, TypeDeclaration> typeDeclarations, List<ObjectProperty> properties) {
        Set<String> childNames = childBuilderNames(typeDeclarations, properties);
        return properties.stream()
                .filter(property -> XmlTypeUtils.getPropertyKind(property).getEnumValue() == XmlPropertyKind.Value.TEXT)
                .filter(property -> childNames.contains(fieldName(property)))
                .findFirst();
    }

    /** The generated field/setter name of an xml object's text property, or empty when it has none. */
    public static Optional<String> textFieldName(
            Map<TypeId, TypeDeclaration> typeDeclarations, List<ObjectProperty> properties) {
        Optional<ObjectProperty> yielding = textPropertyYieldingToChild(typeDeclarations, properties);
        if (yielding.isPresent()) {
            return Optional.of(renamedTextFieldName(yielding.get(), properties));
        }
        return properties.stream()
                .filter(property -> XmlTypeUtils.getPropertyKind(property).getEnumValue() == XmlPropertyKind.Value.TEXT)
                .map(XmlObjectMethodsGenerator::fieldName)
                .findFirst();
    }

    /** {@code text}, or {@code <name>Text} when another property is already called {@code text}. */
    public static String renamedTextFieldName(ObjectProperty textProperty, List<ObjectProperty> properties) {
        boolean textTaken = properties.stream()
                .filter(property -> property != textProperty)
                .anyMatch(property -> fieldName(property).equals(TEXT_FIELD_NAME));
        return textTaken ? fieldName(textProperty) + "Text" : TEXT_FIELD_NAME;
    }

    private static String fieldName(ObjectProperty property) {
        return KeyWordUtils.getKeyWordCompatibleName(
                NameUtils.getName(property.getName()).getCamelCase().getSafeName());
    }

    /** {@code format: uri} strings, also when referenced through (nested) aliases. */
    private boolean isUriString(TypeReference type) {
        TypeReference unwrapped = XmlTypeUtils.unwrapOptional(type);
        Optional<TypeId> typeId = unwrapped.getNamed().map(named -> named.getTypeId());
        if (typeId.isPresent()) {
            TypeDeclaration declaration = typeDeclarations.get(typeId.get());
            return declaration != null
                    && declaration
                            .getShape()
                            .getAlias()
                            .map(alias -> isUriString(alias.getAliasOf()))
                            .orElse(false);
        }
        return unwrapped
                .getPrimitive()
                .flatMap(primitive -> primitive.getV2())
                .flatMap(v2 -> v2.getString())
                .flatMap(string -> string.getValidation())
                .flatMap(validation -> validation.getFormat())
                .filter("uri"::equals)
                .isPresent();
    }

    public XmlObjectMethodsGenerator(
            AbstractGeneratorContext<?, ?> generatorContext,
            ClassName objectClassName,
            TypeId typeId,
            XmlEncoding xmlEncoding,
            List<EnrichedObjectProperty> properties,
            Optional<String> additionalPropertiesFieldName,
            String contentFieldName,
            String contentGetterName,
            boolean usesBuilderConstructor) {
        this.generatorContext = generatorContext;
        this.contentFieldName = contentFieldName;
        this.contentGetterName = contentGetterName;
        this.usesBuilderConstructor = usesBuilderConstructor;
        this.builderClassName = objectClassName.nestedClass(BUILDER_CLASS_NAME);
        this.typeDeclarations = generatorContext.getTypeDeclarations();
        this.objectClassName = objectClassName;
        this.xmlEncoding = xmlEncoding;
        this.typeDocs = Optional.ofNullable(typeDeclarations.get(typeId)).flatMap(TypeDeclaration::getDocs);
        this.properties = properties.stream()
                .filter(property -> property.fieldSpec().isPresent())
                .collect(Collectors.toList());
        this.propertyDocsByFieldName = this.properties.stream()
                .filter(property -> property.docs().isPresent())
                .collect(Collectors.toMap(
                        property -> property.fieldSpec().get().name,
                        property -> property.docs().get(),
                        (a, b) -> a));
        this.additionalPropertiesFieldName = additionalPropertiesFieldName;
        this.xmlWriterClassName = XmlCoreGenerator.getXmlWriterClassName(generatorContext);
        this.xmlReaderClassName = XmlCoreGenerator.getXmlReaderClassName(generatorContext);
        this.xmlSerializableClassName = XmlCoreGenerator.getXmlSerializableClassName(generatorContext);
        this.xmlNodeClassName = XmlCoreGenerator.getXmlNodeClassName(generatorContext);
        this.hasTextProperty = this.properties.stream()
                .anyMatch(property ->
                        XmlTypeUtils.getPropertyKind(property.objectProperty()).getEnumValue()
                                == XmlPropertyKind.Value.TEXT);
    }

    public TypeSpec addXmlSupport(TypeSpec typeSpec) {
        TypeSpec.Builder builder = typeSpec.toBuilder()
                .addSuperinterface(xmlSerializableClassName)
                .addMethod(generateToString())
                .addMethod(generateToXml())
                .addMethod(generateToXmlWithDeclaration())
                .addMethod(generateFromXmlString(objectClassName))
                .addMethod(generateFromXmlElement());
        if (typeSpec.javadoc.isEmpty() && typeDocs.isPresent()) {
            builder.addJavadoc(JavaDocUtils.render(typeDocs.get()));
        }
        List<MethodSpec> childBuilderMethods = generateChildBuilderMethods(typeSpec);
        boolean hasFinalStage =
                typeSpec.typeSpecs.stream().anyMatch(nested -> nested.name.equals(FINAL_STAGE_INTERFACE_NAME));
        Set<String> uriFieldNames = getUriFieldNames();
        generateTextBuilderFactory(typeSpec).ifPresent(factory -> {
            builder.addMethod(factory);
            if (uriFieldNames.contains(factory.parameters.get(0).name)
                    && factory.parameters.get(0).type.equals(ClassName.get(String.class))) {
                builder.addMethod(uriDelegatingFactory(factory));
            }
        });
        Set<String> listAttributeNames = getListAttributeNames();
        Optional<String> textAliasTarget = getTextAliasTarget(typeSpec);
        builder.typeSpecs.clear();
        for (TypeSpec nested : typeSpec.typeSpecs) {
            TypeSpec updated = withChildBuilderMethods(
                    withUriOverloads(
                            withTextAlias(
                                    withListAttributeVarargs(withSetterJavadocs(nested), listAttributeNames),
                                    textAliasTarget),
                            uriFieldNames),
                    childBuilderMethods,
                    hasFinalStage);
            if (nested.name.equals(BUILDER_CLASS_NAME)) {
                updated = updated.toBuilder()
                        .addMethod(generateFromXmlString(builderClassName))
                        .addMethod(generateBuilderFromXmlElement())
                        .build();
            }
            builder.addType(updated);
        }
        return builder.build();
    }

    private MethodSpec generateToXml() {
        return MethodSpec.methodBuilder(TO_XML_METHOD_NAME)
                .addAnnotation(Override.class)
                .addModifiers(Modifier.PUBLIC)
                .returns(String.class)
                .addStatement("return $L(true)", TO_XML_METHOD_NAME)
                .build();
    }

    private MethodSpec generateToString() {
        return MethodSpec.methodBuilder("toString")
                .addAnnotation(Override.class)
                .addModifiers(Modifier.PUBLIC)
                .returns(String.class)
                .addStatement("return $L()", TO_XML_METHOD_NAME)
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
        List<CodeBlock> orderedChildren = new ArrayList<>();
        for (EnrichedObjectProperty property : properties) {
            PropertyShape shape = PropertyShape.of(property, typeDeclarations, generatorContext);
            if (shape.isOrderedContent()) {
                orderedChildren.add(CodeBlock.of("this.$L", property.fieldSpec().get().name));
                continue;
            }
            method.addStatement(generateWriteProperty(property, shape));
        }
        additionalPropertiesFieldName.ifPresent(
                fieldName -> method.addStatement("$L.attributes(this.$L)", WRITER_VARIABLE, fieldName));
        method.addStatement(
                "$L.content($T.ordered($L))",
                WRITER_VARIABLE,
                xmlNodeClassName,
                CodeBlock.join(
                        Stream.concat(Stream.of(CodeBlock.of("this.$L", contentFieldName)), orderedChildren.stream())
                                .collect(Collectors.toList()),
                        ", "));
        method.addStatement("return $L.toXml($L)", WRITER_VARIABLE, XML_DECLARATION_PARAMETER);
        return method.build();
    }

    private CodeBlock generateWriteProperty(EnrichedObjectProperty property, PropertyShape shape) {
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

    private MethodSpec generateFromXmlString(ClassName returnType) {
        return MethodSpec.methodBuilder(FROM_XML_METHOD_NAME)
                .addJavadoc("Parses an xml document whose root element is <$L>.\n", xmlEncoding.getName())
                .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                .addParameter(String.class, "xml")
                .returns(returnType)
                .addStatement("return $L($T.parse(xml))", FROM_XML_METHOD_NAME, xmlReaderClassName)
                .build();
    }

    /**
     * Parses into the immutable type. Regular objects are constructed from one argument per field; very large objects
     * (which only have a builder-based constructor) are populated through the builder's private fields.
     */
    private MethodSpec generateFromXmlElement() {
        MethodSpec.Builder method = MethodSpec.methodBuilder(FROM_XML_METHOD_NAME)
                .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                .addParameter(Element.class, ELEMENT_VARIABLE)
                .returns(objectClassName)
                .addStatement("$T.expect($L, $S)", xmlReaderClassName, ELEMENT_VARIABLE, xmlEncoding.getName());
        List<String> fieldNames = new ArrayList<>();
        List<CodeBlock> values = new ArrayList<>();
        List<String> attributeNames = new ArrayList<>();
        List<String> skippedElementNames = new ArrayList<>();
        List<PropertyShape> orderedShapes = new ArrayList<>();
        for (EnrichedObjectProperty property : properties) {
            PropertyShape shape = PropertyShape.of(property, typeDeclarations, generatorContext);
            switch (shape.kind.getEnumValue()) {
                case ATTRIBUTE:
                    attributeNames.add(shape.xmlName);
                    break;
                case ELEMENT:
                    if (shape.isOrderedContent()) {
                        orderedShapes.add(shape);
                    } else {
                        skippedElementNames.addAll(
                                shape.wrapped ? Collections.singletonList(shape.xmlName) : shape.elementNames());
                    }
                    break;
                default:
                    break;
            }
            fieldNames.add(property.fieldSpec().get().name);
            values.add(generateReadProperty(property, shape));
        }
        method.addStatement(
                "$T<$T> $L = $T.content($L, $L, $L, $L)",
                List.class,
                xmlNodeClassName,
                CONTENT_VARIABLE,
                xmlReaderClassName,
                ELEMENT_VARIABLE,
                hasTextProperty,
                stringList(skippedElementNames),
                generateTypedChildFunction(orderedShapes));
        additionalPropertiesFieldName.ifPresent(fieldName -> {
            fieldNames.add(fieldName);
            values.add(CodeBlock.of(
                    "$T.extraAttributes($L, $L)", xmlReaderClassName, ELEMENT_VARIABLE, stringList(attributeNames)));
        });
        fieldNames.add(contentFieldName);
        values.add(CodeBlock.of("$L", CONTENT_VARIABLE));
        if (!usesBuilderConstructor) {
            method.addStatement("return new $T($L)", objectClassName, CodeBlock.join(values, ",\n"));
            return method.build();
        }
        method.addStatement("$T builder = new $T()", builderClassName, builderClassName);
        for (int i = 0; i < fieldNames.size(); i++) {
            method.addStatement("builder.$L = $L", fieldNames.get(i), values.get(i));
        }
        method.addStatement("return new $T(builder)", objectClassName);
        return method.build();
    }

    /**
     * A {@code Function<Element, XmlSerializable>} mapping a child element to the typed model it parses into, or
     * {@code null} for children that are not described by the API (kept as generic {@code XmlElement}s).
     */
    private CodeBlock generateTypedChildFunction(List<PropertyShape> orderedShapes) {
        if (orderedShapes.isEmpty()) {
            return CodeBlock.of("e -> null");
        }
        CodeBlock.Builder function = CodeBlock.builder()
                .add("e -> {\n")
                .indent()
                .beginControlFlow("switch ($T.localName(e))", xmlReaderClassName);
        Set<String> handled = new HashSet<>();
        for (PropertyShape shape : orderedShapes) {
            List<String> names =
                    shape.elementNames().stream().filter(handled::add).collect(Collectors.toList());
            if (names.isEmpty()) {
                continue;
            }
            for (String name : names) {
                function.add("case $S:\n", name);
            }
            function.indent()
                    .add("return $T.$L(e);\n", shape.itemTypeName, FROM_XML_METHOD_NAME)
                    .unindent();
        }
        function.add("default:\n")
                .indent()
                .add("return null;\n")
                .unindent()
                .endControlFlow()
                .unindent()
                .add("}");
        return function.build();
    }

    /** {@code Builder.fromXml(Element)}: parses into the immutable type, then copies everything into a builder. */
    private MethodSpec generateBuilderFromXmlElement() {
        MethodSpec.Builder method = MethodSpec.methodBuilder(FROM_XML_METHOD_NAME)
                .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                .addParameter(Element.class, ELEMENT_VARIABLE)
                .returns(builderClassName)
                .addStatement(
                        "$T parsed = $T.$L($L)",
                        objectClassName,
                        objectClassName,
                        FROM_XML_METHOD_NAME,
                        ELEMENT_VARIABLE)
                .addStatement("$T builder = new $T().from(parsed)", builderClassName, builderClassName);
        additionalPropertiesFieldName.ifPresent(fieldName -> method.addStatement(
                "builder.$L(parsed.$L())",
                fieldName,
                fieldName.startsWith("_") ? "_getAdditionalProperties" : "getAdditionalProperties"));
        method.addStatement("return builder");
        return method.build();
    }

    private static CodeBlock stringList(List<String> values) {
        return CodeBlock.of(
                "$T.asList($L)",
                Arrays.class,
                values.stream().map(value -> CodeBlock.of("$S", value)).collect(CodeBlock.joining(", ")));
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
                        CodeBlock.of("$T.leadingText($L)", xmlReaderClassName, ELEMENT_VARIABLE),
                        shape,
                        "text content");
                break;
            case ELEMENT:
            default:
                value = shape.isOrderedContent() ? readOrderedChildren(shape) : readChildElements(shape);
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
                            "$T.split(raw, $S)", xmlReaderClassName, shape.listSeparator.orElse(DEFAULT_LIST_SEPARATOR))
                    : CodeBlock.of(
                            "$T.split(raw, $S).stream().map($L).collect($T.toList())",
                            xmlReaderClassName,
                            shape.listSeparator.orElse(DEFAULT_LIST_SEPARATOR),
                            converter,
                            Collectors.class);
            CodeBlock parsed = CodeBlock.of("$L.map(raw -> $L)", source, items);
            return shape.optional ? parsed : CodeBlock.of("$L.orElseGet($T::emptyList)", parsed, Collections.class);
        }
        CodeBlock parsed = converter.isEmpty() ? source : CodeBlock.of("$L.map($L)", source, converter);
        return shape.optional ? parsed : required(parsed, xmlEncoding.getName(), description);
    }

    /** Reads a typed child property back out of the ordered content parsed by {@code XmlReader.content}. */
    private CodeBlock readOrderedChildren(PropertyShape shape) {
        CodeBlock elements =
                CodeBlock.of("$T.elements($L, $T.class)", xmlNodeClassName, CONTENT_VARIABLE, shape.itemTypeName);
        if (shape.list) {
            return shape.optional ? CodeBlock.of("$T.optionalList($L)", xmlReaderClassName, elements) : elements;
        }
        CodeBlock first = CodeBlock.of("$L.stream().findFirst()", elements);
        return shape.optional
                ? first
                : required(first, xmlEncoding.getName(), "<" + shape.itemElementName() + "> element");
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
        Set<String> takenSignatures = new HashSet<>();
        typeSpec.typeSpecs.forEach(nested -> nested.methodSpecs.forEach(method -> {
            takenNames.add(method.name);
            takenSignatures.add(signature(method.name, method.parameters));
        }));
        List<MethodSpec> methods = new ArrayList<>();
        for (EnrichedObjectProperty property : properties) {
            PropertyShape shape = PropertyShape.of(property, typeDeclarations, generatorContext);
            if (shape.kind.getEnumValue() != XmlPropertyKind.Value.ELEMENT || !shape.list || !shape.itemIsElement) {
                continue;
            }
            String fieldName = property.fieldSpec().get().name;
            for (ChildVariant variant : shape.childVariants()) {
                String legacyName = KeyWordUtils.getKeyWordCompatibleMethodName(variant.camelCaseName);
                String methodName = legacyName;
                for (int suffix = 1; !takenNames.add(methodName); suffix++) {
                    methodName = "add" + variant.pascalCaseName + (suffix == 1 ? "" : suffix);
                }
                CodeBlock item = variant.isUnionMember
                        ? CodeBlock.of("$T.of($L)", shape.itemTypeName, variant.parameterName)
                        : CodeBlock.of("$L", variant.parameterName);
                MethodSpec.Builder method = MethodSpec.methodBuilder(methodName)
                        .addJavadoc(
                                "Appends a &lt;$L&gt; child element after any content added so far.\n",
                                variant.elementName)
                        .addModifiers(Modifier.PUBLIC)
                        .addParameter(variant.typeName, variant.parameterName)
                        .returns(objectClassName.nestedClass(BUILDER_CLASS_NAME));
                if (variant.docs.isPresent()) {
                    method.addJavadoc(JavaDocUtils.render(variant.docs.get()));
                }
                method.addJavadoc(JavaDocUtils.getParameterJavadoc(
                        variant.parameterName, "the &lt;" + variant.elementName + "&gt; element to append"));
                method.addJavadoc(JavaDocUtils.getReturnDocs("this builder"));
                method.addStatement("$T item = $L", shape.itemTypeName, item);
                if (shape.optional) {
                    method.addStatement(
                                    "$T<$T> updated = new $T<>(this.$L.orElseGet($T::emptyList))",
                                    List.class,
                                    shape.itemTypeName,
                                    ArrayList.class,
                                    fieldName,
                                    Collections.class)
                            .addStatement("updated.add(item)")
                            .addStatement("this.$L = $T.of(updated)", fieldName, Optional.class);
                } else {
                    method.addStatement("this.$L.add(item)", fieldName);
                }
                method.addStatement("this.$L.add($T.element(item))", contentFieldName, xmlNodeClassName);
                methods.add(method.addStatement("return this").build());
                ParameterSpec parameter = ParameterSpec.builder(variant.typeName, variant.parameterName)
                        .build();
                if (!methodName.equals(legacyName)
                        && takenSignatures.add(signature(legacyName, Collections.singletonList(parameter)))) {
                    methods.add(MethodSpec.methodBuilder(legacyName)
                            .addJavadoc(
                                    "Appends a &lt;$L&gt; child element after any content added so far.\n",
                                    variant.elementName)
                            .addJavadoc(JavaDocUtils.getParameterJavadoc(
                                    variant.parameterName, "the &lt;" + variant.elementName + "&gt; element to append"))
                            .addJavadoc(JavaDocUtils.getReturnDocs("this builder"))
                            .addModifiers(Modifier.PUBLIC)
                            .addParameter(parameter)
                            .returns(objectClassName.nestedClass(BUILDER_CLASS_NAME))
                            .addStatement("return $L($L)", methodName, variant.parameterName)
                            .build());
                }
                String childMethodName = methodName;
                childTextSetter(variant).ifPresent(textSetter -> {
                    ParameterSpec textParameter =
                            ParameterSpec.builder(String.class, TEXT_FIELD_NAME).build();
                    String textMethodName =
                            takenSignatures.add(signature(legacyName, Collections.singletonList(textParameter)))
                                    ? legacyName
                                    : childMethodName;
                    if (!textMethodName.equals(legacyName)
                            && !takenSignatures.add(
                                    signature(childMethodName, Collections.singletonList(textParameter)))) {
                        return;
                    }
                    methods.add(MethodSpec.methodBuilder(textMethodName)
                            .addJavadoc(
                                    "Appends a &lt;$L&gt; child element with the given text content after any content added so far.\n",
                                    variant.elementName)
                            .addJavadoc(JavaDocUtils.getParameterJavadoc(
                                    TEXT_FIELD_NAME,
                                    "the text content of the &lt;" + variant.elementName + "&gt; element"))
                            .addJavadoc(JavaDocUtils.getReturnDocs("this builder"))
                            .addModifiers(Modifier.PUBLIC)
                            .addParameter(textParameter)
                            .returns(objectClassName.nestedClass(BUILDER_CLASS_NAME))
                            .addStatement(
                                    "return $L($T.builder().$L($L).build())",
                                    childMethodName,
                                    variant.typeName,
                                    textSetter,
                                    TEXT_FIELD_NAME)
                            .build());
                });
            }
        }
        return methods;
    }

    /**
     * The text setter of a child type whose only required property is its text, so {@code body("hi")} can build the
     * child from a string ({@code Body.builder().text("hi").build()}); empty otherwise.
     */
    private Optional<String> childTextSetter(ChildVariant variant) {
        Optional<ObjectTypeDeclaration> object = variant.declaration.getShape().getObject();
        if (object.isEmpty()
                || variant.isUnionMember && !object.get().getExtends().isEmpty()) {
            return Optional.empty();
        }
        List<ObjectProperty> childProperties = new ArrayList<>(object.get().getProperties());
        object.get().getExtendedProperties().ifPresent(childProperties::addAll);
        boolean othersOptional = childProperties.stream()
                .filter(property -> XmlTypeUtils.getPropertyKind(property).getEnumValue() != XmlPropertyKind.Value.TEXT)
                .allMatch(property -> XmlTypeUtils.isOptional(property.getValueType()));
        if (!othersOptional) {
            return Optional.empty();
        }
        return textFieldName(typeDeclarations, childProperties);
    }

    /** The text field's setter name when a {@code text(...)} alias should be generated for it. */
    private Optional<String> getTextAliasTarget(TypeSpec typeSpec) {
        Optional<String> textField = properties.stream()
                .filter(property ->
                        XmlTypeUtils.getPropertyKind(property.objectProperty()).getEnumValue()
                                == XmlPropertyKind.Value.TEXT)
                .map(property -> property.fieldSpec().get().name)
                .findFirst();
        if (textField.isEmpty() || textField.get().equals(TEXT_FIELD_NAME)) {
            return Optional.empty();
        }
        boolean textTaken = typeSpec.typeSpecs.stream()
                .flatMap(nested -> nested.methodSpecs.stream())
                .anyMatch(method -> method.name.equals(TEXT_FIELD_NAME));
        return textTaken ? Optional.empty() : textField;
    }

    /** {@code text(...)} next to every single-argument setter of the text field, in stages and the builder alike. */
    private static TypeSpec withTextAlias(TypeSpec nested, Optional<String> textField) {
        if (textField.isEmpty()) {
            return nested;
        }
        List<MethodSpec> aliases = nested.methodSpecs.stream()
                .filter(method -> method.name.equals(textField.get()) && method.parameters.size() == 1)
                .map(method -> delegatingOverload(
                        method,
                        TEXT_FIELD_NAME,
                        ParameterSpec.builder(method.parameters.get(0).type, TEXT_FIELD_NAME)
                                .addModifiers(method.parameters.get(0).modifiers)
                                .addAnnotations(method.parameters.get(0).annotations)
                                .build(),
                        CodeBlock.of("$L", TEXT_FIELD_NAME),
                        "Sets the text content of this element (same as {@code " + textField.get() + "(...)}).\n"))
                .collect(Collectors.toList());
        return aliases.isEmpty()
                ? nested
                : nested.toBuilder().addMethods(aliases).build();
    }

    private Set<String> getUriFieldNames() {
        return properties.stream()
                .filter(property -> isUriString(property.objectProperty().getValueType()))
                .map(property -> property.fieldSpec().get().name)
                .collect(Collectors.toSet());
    }

    /** {@code url(URI)} next to every {@code url(String)} setter of a {@code format: uri} string property. */
    private static TypeSpec withUriOverloads(TypeSpec nested, Set<String> uriFieldNames) {
        if (uriFieldNames.isEmpty()) {
            return nested;
        }
        List<MethodSpec> overloads = nested.methodSpecs.stream()
                .filter(method -> uriFieldNames.contains(method.name)
                        && method.parameters.size() == 1
                        && method.parameters.get(0).type.equals(ClassName.get(String.class)))
                .map(method -> delegatingOverload(
                        method,
                        method.name,
                        ParameterSpec.builder(URI.class, method.parameters.get(0).name)
                                .build(),
                        CodeBlock.of("$L.toString()", method.parameters.get(0).name),
                        "Sets {@code " + method.name + "} from a {@link URI}.\n"))
                .collect(Collectors.toList());
        return overloads.isEmpty()
                ? nested
                : nested.toBuilder().addMethods(overloads).build();
    }

    /** A method with the same return type as {@code target} that delegates to it; abstract when {@code target} is. */
    private static MethodSpec delegatingOverload(
            MethodSpec target, String name, ParameterSpec parameter, CodeBlock argument, String javadoc) {
        MethodSpec.Builder method = MethodSpec.methodBuilder(name)
                .addJavadoc(javadoc)
                .addParameter(parameter)
                .returns(target.returnType);
        if (target.modifiers.contains(Modifier.ABSTRACT)) {
            return method.addModifiers(Modifier.PUBLIC, Modifier.ABSTRACT).build();
        }
        method.addModifiers(Modifier.PUBLIC);
        if (target.annotations.stream().anyMatch(annotation -> annotation.type.equals(ClassName.get(Override.class)))) {
            method.addAnnotation(Override.class);
        }
        return method.addStatement("return $L($L)", target.name, argument).build();
    }

    private static String signature(String name, List<ParameterSpec> parameters) {
        return name
                + parameters.stream()
                        .map(parameter -> parameter.type.toString())
                        .collect(Collectors.joining(",", "(", ")"));
    }

    /**
     * {@code builder(text)} for types whose text content is required, so {@code Say.builder("hi")} reads like the
     * legacy constructors; only generated when the text is the first stage of the staged builder.
     */
    private Optional<MethodSpec> generateTextBuilderFactory(TypeSpec typeSpec) {
        Optional<String> textFieldName = properties.stream()
                .filter(property -> {
                    PropertyShape shape = PropertyShape.of(property, typeDeclarations, generatorContext);
                    return shape.kind.getEnumValue() == XmlPropertyKind.Value.TEXT && !shape.optional;
                })
                .map(property -> property.fieldSpec().get().name)
                .findFirst();
        Optional<MethodSpec> factory = typeSpec.methodSpecs.stream()
                .filter(method -> method.name.equals("builder")
                        && method.parameters.isEmpty()
                        && method.modifiers.contains(Modifier.STATIC))
                .findFirst();
        if (textFieldName.isEmpty() || factory.isEmpty() || !(factory.get().returnType instanceof ClassName)) {
            return Optional.empty();
        }
        String firstStageName = ((ClassName) factory.get().returnType).simpleName();
        return typeSpec.typeSpecs.stream()
                .filter(nested -> nested.name.equals(firstStageName) && !nested.name.equals(BUILDER_CLASS_NAME))
                .flatMap(nested -> nested.methodSpecs.stream())
                .filter(method -> method.name.equals(textFieldName.get()) && method.parameters.size() == 1)
                .findFirst()
                .map(stageMethod -> MethodSpec.methodBuilder("builder")
                        .addJavadoc("Starts a builder with the element's text content set.\n")
                        .addJavadoc(JavaDocUtils.getParameterJavadoc(
                                textFieldName.get(), "the text content of the element"))
                        .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                        .addParameter(stageMethod.parameters.get(0).type, textFieldName.get())
                        .returns(stageMethod.returnType)
                        .addStatement("return builder().$L($L)", textFieldName.get(), textFieldName.get())
                        .build());
    }

    /** {@code builder(URI)} next to {@code builder(String)} when the required text is a URL. */
    private static MethodSpec uriDelegatingFactory(MethodSpec factory) {
        String parameterName = factory.parameters.get(0).name;
        return MethodSpec.methodBuilder(factory.name)
                .addJavadoc("Starts a builder with the element's text content set from a {@link $T}.\n", URI.class)
                .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                .addParameter(URI.class, parameterName)
                .returns(factory.returnType)
                .addStatement("return $L($L.toString())", factory.name, parameterName)
                .build();
    }

    private Set<String> getListAttributeNames() {
        Set<String> names = new HashSet<>();
        for (EnrichedObjectProperty property : properties) {
            PropertyShape shape = PropertyShape.of(property, typeDeclarations, generatorContext);
            if (shape.kind.getEnumValue() == XmlPropertyKind.Value.ATTRIBUTE && shape.list) {
                names.add(property.fieldSpec().get().name);
            }
        }
        return names;
    }

    /**
     * Adds a varargs overload next to every {@code List} setter of a list-valued attribute, so a single value or a few
     * values can be passed without building a list ({@code gather.input(GatherInputItem.DTMF)}).
     */
    private static TypeSpec withListAttributeVarargs(TypeSpec nested, Set<String> listAttributeNames) {
        List<MethodSpec> listSetters = nested.methodSpecs.stream()
                .filter(method -> listAttributeNames.contains(method.name)
                        && method.parameters.size() == 1
                        && method.parameters.get(0).type instanceof ParameterizedTypeName
                        && ((ParameterizedTypeName) method.parameters.get(0).type)
                                .rawType.equals(ClassName.get(List.class)))
                .collect(Collectors.toMap(
                        method -> method.name, method -> method, (first, second) -> first, LinkedHashMap::new))
                .values()
                .stream()
                .collect(Collectors.toList());
        if (listSetters.isEmpty()) {
            return nested;
        }
        TypeSpec.Builder builder = nested.toBuilder();
        for (MethodSpec setter : listSetters) {
            MethodSpec.Builder varargs = MethodSpec.methodBuilder(setter.name)
                    .addJavadoc(setter.javadoc)
                    .addModifiers(setter.modifiers)
                    .addAnnotations(setter.annotations)
                    .addParameter(
                            ArrayTypeName.of(
                                    ((ParameterizedTypeName) setter.parameters.get(0).type).typeArguments.get(0)),
                            setter.name)
                    .varargs()
                    .returns(setter.returnType);
            if (!setter.modifiers.contains(Modifier.ABSTRACT)) {
                varargs.addStatement("return $L($T.asList($L))", setter.name, Arrays.class, setter.name);
            }
            builder.addMethod(varargs.build());
        }
        return builder.build();
    }

    /**
     * Copies the property description onto builder setters that were generated without one (the non-Optional
     * overloads), so every way of setting an attribute shows its documentation.
     */
    private TypeSpec withSetterJavadocs(TypeSpec nested) {
        if (nested.methodSpecs.stream().noneMatch(this::isUndocumentedSetter)) {
            return nested;
        }
        TypeSpec.Builder builder = nested.toBuilder();
        builder.methodSpecs.clear();
        for (MethodSpec method : nested.methodSpecs) {
            if (!isUndocumentedSetter(method)) {
                builder.addMethod(method);
                continue;
            }
            builder.addMethod(method.toBuilder()
                    .addJavadoc(JavaDocUtils.render(propertyDocsByFieldName.get(method.name)))
                    .build());
        }
        return builder.build();
    }

    private boolean isUndocumentedSetter(MethodSpec method) {
        return method.javadoc.isEmpty()
                && method.parameters.size() == 1
                && propertyDocsByFieldName.containsKey(method.name);
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
        private final Optional<String> docs;
        private final TypeDeclaration declaration;

        private ChildVariant(
                TypeName typeName, String elementName, TypeDeclaration declaration, boolean isUnionMember) {
            this.typeName = typeName;
            this.elementName = elementName;
            this.declaration = declaration;
            this.docs = declaration.getDocs();
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

        /**
         * Whether the property's children live in the element's ordered content (typed child elements, as opposed to
         * scalar elements and wrapped lists which are always written in property order).
         */
        boolean isOrderedContent() {
            return kind.getEnumValue() == XmlPropertyKind.Value.ELEMENT && itemIsElement && !wrapped;
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
