package com.fern.java;

import com.fern.ir.model.ir.IntermediateRepresentation;
import com.fern.ir.model.types.DeclaredTypeName;
import com.squareup.javapoet.ClassName;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public abstract class AbstractPoetClassNameFactory {

    private static final String OBJECT_MAPPERS_CLASS_SIMPLE_NAME = "ObjectMappers";

    private final List<String> packagePrefixTokens;

    protected final ICustomConfig.PackageLayout packageLayout;

    public AbstractPoetClassNameFactory(List<String> packagePrefixTokens, ICustomConfig.PackageLayout packageLayout) {
        this.packagePrefixTokens = packagePrefixTokens;
        this.packageLayout = packageLayout;
    }

    public abstract ClassName getTypeClassName(DeclaredTypeName declaredTypeName);

    public abstract ClassName getInterfaceClassName(DeclaredTypeName declaredTypeName);

    public final ClassName getObjectMapperClassName() {
        return getCoreClassName(OBJECT_MAPPERS_CLASS_SIMPLE_NAME);
    }

    public final ClassName getCoreClassName(String className) {
        return ClassName.get(getCorePackage(), className);
    }

    public final ClassName getRootClassName(String className) {
        return ClassName.get(getRootPackage(), className);
    }

    public final String getCorePackage() {
        List<String> tokens = new ArrayList<>(packagePrefixTokens);
        tokens.add("core");
        return String.join(".", tokens);
    }

    public final String getPaginationPackage() {
        switch (packageLayout) {
            case FLAT:
                return getCorePackage();
            case NESTED:
            default:
                return getCorePackage() + ".pagination";
        }
    }

    public final String getRootPackage() {
        List<String> tokens = new ArrayList<>(packagePrefixTokens);
        return String.join(".", tokens);
    }

    public final ClassName getDateTimeDeserializerClassName() {
        return ClassName.get(getCorePackage(), "DateTimeDeserializer");
    }

    public final ClassName getStreamClassName() {
        return ClassName.get(getCorePackage(), "Stream");
    }

    public final ClassName getPaginationClassName(String simpleName) {
        return ClassName.get(getPaginationPackage(), simpleName);
    }

    public final List<String> getPackagePrefixTokens() {
        return packagePrefixTokens;
    }

    public static List<String> splitOnNonAlphaNumericChar(String value) {
        return Arrays.asList(value.split("[^a-zA-Z0-9]"));
    }

    public static List<String> getPackagePrefixWithOrgAndApiName(IntermediateRepresentation ir, String organization) {
        List<String> prefix = new ArrayList<>();
        prefix.add("com");
        prefix.addAll(splitOnNonAlphaNumericChar(organization));
        prefix.addAll(splitOnNonAlphaNumericChar(ir.getApiName().getCamelCase().getSafeName()));
        return prefix;
    }
}
