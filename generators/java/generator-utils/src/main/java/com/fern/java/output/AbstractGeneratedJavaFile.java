package com.fern.java.output;

import com.fern.java.utils.JavaFileWriter;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.JavaFile;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public abstract class AbstractGeneratedJavaFile extends GeneratedFile {

    private static final Logger log = LoggerFactory.getLogger(AbstractGeneratedJavaFile.class);

    public abstract ClassName getClassName();

    public abstract JavaFile javaFile();

    public abstract Optional<Boolean> testFile();

    @Override
    public final String filename() {
        return getClassName().simpleName() + ".java";
    }

    @Override
    public final void writeToFile(Path directory, boolean isLocal, Optional<String> packagePrefix) throws IOException {
        Path filepath;
        if (isLocal) {
            if (packagePrefix.isPresent()) {
                String replacedPackageName = javaFile().packageName.replace(packagePrefix.get(), "");
                if (replacedPackageName.startsWith(".")) {
                    replacedPackageName = replacedPackageName.substring(1);
                }
                String fileName = replacedPackageName.isEmpty()
                        ? javaFile().typeSpec.name
                        : replacedPackageName + "." + javaFile().typeSpec.name;
                filepath = directory.resolve(Paths.get(fileName.replace('.', '/') + ".java"));
            } else {
                filepath = directory
                        .resolve(javaFile().packageName.replace(".", "/"))
                        .resolve(javaFile().typeSpec.name + ".java");
            }
        } else if (testFile().isPresent() && testFile().get()) {
            filepath = directory
                    .resolve("src/test/java")
                    .resolve(javaFile().packageName.replace(".", "/"))
                    .resolve(javaFile().typeSpec.name + ".java");
        } else {
            filepath = directory
                    .resolve("src/main/java")
                    .resolve(javaFile().packageName.replace(".", "/"))
                    .resolve(javaFile().typeSpec.name + ".java");
        }
        JavaFileWriter.write(filepath, javaFile().toString());
    }
}
