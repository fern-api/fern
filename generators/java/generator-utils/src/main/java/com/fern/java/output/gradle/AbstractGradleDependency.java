package com.fern.java.output.gradle;

public abstract class AbstractGradleDependency {

    public abstract GradleDependencyType type();

    public abstract String coordinate();

    @Override
    public final String toString() {
        return type().toString() + " " + coordinate();
    }
}
