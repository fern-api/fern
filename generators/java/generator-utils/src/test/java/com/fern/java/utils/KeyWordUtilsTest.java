package com.fern.java.utils;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

class KeyWordUtilsTest {

    @ParameterizedTest
    @ValueSource(
            strings = {
                "abstract",
                "assert",
                "boolean",
                "break",
                "byte",
                "case",
                "catch",
                "char",
                "class",
                "const",
                "continue",
                "default",
                "do",
                "double",
                "else",
                "enum",
                "extends",
                "final",
                "finally",
                "float",
                "for",
                "goto",
                "if",
                "implements",
                "import",
                "instanceof",
                "int",
                "interface",
                "long",
                "native",
                "new",
                "package",
                "private",
                "protected",
                "public",
                "return",
                "short",
                "static",
                "strictfp",
                "super",
                "switch",
                "synchronized",
                "this",
                "throw",
                "throws",
                "transient",
                "try",
                "void",
                "volatile",
                "while",
                "true",
                "false",
                "null",
                "_"
            })
    void getKeyWordCompatibleName_prefixesReservedWords(String keyword) {
        assertThat(KeyWordUtils.getKeyWordCompatibleName(keyword)).isEqualTo("_" + keyword);
    }

    @ParameterizedTest
    @ValueSource(strings = {"True", "FALSE", "Null", "Class", "If"})
    void getKeyWordCompatibleName_isCaseInsensitive(String mixedCaseKeyword) {
        assertThat(KeyWordUtils.getKeyWordCompatibleName(mixedCaseKeyword)).isEqualTo("_" + mixedCaseKeyword);
    }

    @ParameterizedTest
    @ValueSource(strings = {"name", "userId", "fooBar", "trueish", "newValue", "ifBranch"})
    void getKeyWordCompatibleName_leavesNonReservedNamesUnchanged(String name) {
        assertThat(KeyWordUtils.getKeyWordCompatibleName(name)).isEqualTo(name);
    }

    @ParameterizedTest
    @ValueSource(strings = {"getClass", "notify", "notifyAll", "wait"})
    void getKeyWordCompatibleMethodName_suffixesReservedMethodNames(String methodName) {
        assertThat(KeyWordUtils.getKeyWordCompatibleMethodName(methodName)).isEqualTo(methodName + "_");
    }

    @Test
    void getKeyWordCompatibleMethodName_leavesNormalMethodNamesUnchanged() {
        assertThat(KeyWordUtils.getKeyWordCompatibleMethodName("getName")).isEqualTo("getName");
    }
}
