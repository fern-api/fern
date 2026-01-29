package com.fern.java.output;

import com.fern.java.ICustomConfig.OutputDirectory;
import com.fern.java.utils.JavaFileWriter;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.JavaFile;
import java.io.IOException;
import java.nio.file.Path;
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
    public final void writeToFile(
            Path directory, boolean isLocal, Optional<String> packagePrefix, OutputDirectory outputDirectoryMode)
            throws IOException {
        String packagePath;
        if (isLocal && packagePrefix.isPresent()) {
            String replacedPackageName = javaFile().packageName.replace(packagePrefix.get(), "");
            if (replacedPackageName.startsWith(".")) {
                replacedPackageName = replacedPackageName.substring(1);
            }
            packagePath = replacedPackageName.replace('.', '/');
        } else {
            packagePath = javaFile().packageName.replace(".", "/");
        }

        Path filepath;
        if (testFile().isPresent() && testFile().get()) {
            // For test files, check output directory mode
            Path baseDir = directory;
            if (outputDirectoryMode == OutputDirectory.PROJECT_ROOT) {
                baseDir = directory.resolve("src/test/java");
            }
            filepath = baseDir.resolve(packagePath).resolve(javaFile().typeSpec.name + ".java");
        } else {
            // For production files, check output directory mode
            Path baseDir = directory;
            if (outputDirectoryMode == OutputDirectory.PROJECT_ROOT) {
                baseDir = directory.resolve("src/main/java");
            }
            filepath = baseDir.resolve(packagePath).resolve(javaFile().typeSpec.name + ".java");
        }
        JavaFileWriter.write(filepath, javaFile().toString());
    }
}
