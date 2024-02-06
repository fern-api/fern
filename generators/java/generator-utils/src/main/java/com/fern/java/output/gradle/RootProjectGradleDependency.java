package com.fern.java.output.gradle;

public final class RootProjectGradleDependency extends AbstractGradleDependency {

    public static final RootProjectGradleDependency INSTANCE = new RootProjectGradleDependency();

    @Override
    public GradleDependencyType type() {
        return GradleDependencyType.IMPLEMENTATION;
    }

    @Override
    public String coordinate() {
        return "rootProject";
    }
}
