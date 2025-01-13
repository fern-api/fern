package com.fern.java.generators.object;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fern.ir.model.commons.Name;
import com.fern.ir.model.types.ContainerType;
import com.fern.ir.model.types.Literal;
import com.fern.ir.model.types.ObjectProperty;
import com.fern.java.immutables.StagedBuilderImmutablesStyle;
import com.fern.java.utils.JavaDocUtils;
import com.fern.java.utils.KeyWordUtils;
import com.squareup.javapoet.AnnotationSpec;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.TypeName;
import java.util.Optional;
import javax.lang.model.element.Modifier;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderImmutablesStyle
public interface EnrichedObjectProperty {

    Optional<String> wireKey();

    String camelCaseKey();

    String pascalCaseKey();

    TypeName poetTypeName();

    boolean fromInterface();

    Optional<String> docs();

    Optional<Literal> literal();

    ObjectProperty objectProperty();

    @Value.Lazy
    default Optional<FieldSpec> fieldSpec() {
        if (literal().isPresent()) {
            return Optional.empty();
        }
        return Optional.of(FieldSpec.builder(
                        poetTypeName(),
                        KeyWordUtils.getKeyWordCompatibleName(camelCaseKey()),
                        Modifier.PRIVATE,
                        Modifier.FINAL)
                .build());
    }

    @Value.Lazy
    default MethodSpec getterProperty() {
        MethodSpec.Builder getterBuilder = MethodSpec.methodBuilder(
                        KeyWordUtils.getKeyWordCompatibleMethodName("get" + pascalCaseKey()))
                .addModifiers(Modifier.PUBLIC)
                .returns(poetTypeName());
        if (literal().isPresent()) {
            literal().get().visit(new Literal.Visitor<Void>() {
                @Override
                public Void visitString(String string) {
                    getterBuilder.addStatement("return $S", string);
                    return null;
                }

                @Override
                public Void visitBoolean(boolean boolean_) {
                    getterBuilder.addStatement("return $L", boolean_);
                    return null;
                }

                @Override
                public Void _visitUnknown(Object unknownType) {
                    return null;
                }
            });
        } else {
            getterBuilder.addStatement("return $L", fieldSpec().get().name);
        }
        if (wireKey().isPresent()) {
            getterBuilder.addAnnotation(AnnotationSpec.builder(JsonProperty.class)
                    .addMember("value", "$S", wireKey().get())
                    .build());
        }
        if (fromInterface()) {
            getterBuilder.addAnnotation(ClassName.get("", "java.lang.Override"));
        }
        if (docs().isPresent()) {
            getterBuilder.addJavadoc(JavaDocUtils.getReturnDocs(docs().get()));
        }
        return getterBuilder.build();
    }

    static ImmutableEnrichedObjectProperty.CamelCaseKeyBuildStage builder() {
        return ImmutableEnrichedObjectProperty.builder();
    }

    static EnrichedObjectProperty of(ObjectProperty objectProperty, boolean fromInterface, TypeName poetTypeName) {
        Name name = objectProperty.getName().getName();
        Optional<Literal> maybeLiteral =
                objectProperty.getValueType().getContainer().flatMap(ContainerType::getLiteral);
        return EnrichedObjectProperty.builder()
                .camelCaseKey(name.getCamelCase().getSafeName())
                .pascalCaseKey(name.getPascalCase().getSafeName())
                .poetTypeName(poetTypeName)
                .fromInterface(fromInterface)
                .objectProperty(objectProperty)
                .wireKey(objectProperty.getName().getWireValue())
                .docs(objectProperty.getDocs())
                .literal(maybeLiteral)
                .build();
    }
}
