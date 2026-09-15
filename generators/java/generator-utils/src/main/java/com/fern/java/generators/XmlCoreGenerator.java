package com.fern.java.generators;

import com.fern.java.AbstractGeneratorContext;
import com.fern.java.output.GeneratedFile;
import com.fern.java.output.GeneratedResourcesJavaFile;
import com.squareup.javapoet.ClassName;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;

/** Emits the core xml runtime (XmlSerializable, XmlWriter, XmlReader) used by xml-encoded types. */
public final class XmlCoreGenerator extends AbstractFilesGenerator {

    public static final String XML_SERIALIZABLE_CLASS_NAME = "XmlSerializable";
    public static final String XML_WRITER_CLASS_NAME = "XmlWriter";
    public static final String XML_READER_CLASS_NAME = "XmlReader";

    public XmlCoreGenerator(AbstractGeneratorContext<?, ?> generatorContext) {
        super(generatorContext);
    }

    public static ClassName getXmlSerializableClassName(AbstractGeneratorContext<?, ?> generatorContext) {
        return generatorContext.getPoetClassNameFactory().getCoreClassName(XML_SERIALIZABLE_CLASS_NAME);
    }

    public static ClassName getXmlWriterClassName(AbstractGeneratorContext<?, ?> generatorContext) {
        return generatorContext.getPoetClassNameFactory().getCoreClassName(XML_WRITER_CLASS_NAME);
    }

    public static ClassName getXmlReaderClassName(AbstractGeneratorContext<?, ?> generatorContext) {
        return generatorContext.getPoetClassNameFactory().getCoreClassName(XML_READER_CLASS_NAME);
    }

    @Override
    public List<GeneratedFile> generateFiles() {
        return List.of(
                generateResource(getXmlSerializableClassName(generatorContext)),
                generateResource(getXmlWriterClassName(generatorContext)),
                generateResource(getXmlReaderClassName(generatorContext)));
    }

    private GeneratedFile generateResource(ClassName className) {
        String resourceName = "/" + className.simpleName() + ".java";
        try (InputStream is = XmlCoreGenerator.class.getResourceAsStream(resourceName)) {
            String contents = new String(is.readAllBytes(), StandardCharsets.UTF_8);
            return GeneratedResourcesJavaFile.builder()
                    .className(className)
                    .contents(contents)
                    .build();
        } catch (IOException e) {
            throw new RuntimeException("Failed to read " + resourceName, e);
        }
    }
}
