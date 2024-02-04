package com.fern.java.output;

public final class RawFileWriter {

    private final StringBuilder stringBuilder;
    private final String indent;

    private int numIndents = 0;

    public RawFileWriter(int indentInSpaces) {
        this.stringBuilder = new StringBuilder();
        this.indent = " ".repeat(indentInSpaces);
    }

    public RawFileWriter() {
        this(4);
    }

    public void append(String val) {
        stringBuilder.append(val);
    }

    private void indent() {
        this.numIndents += 1;
    }

    private void unIndent() {
        this.numIndents -= 1;
    }

    public void addLine(String line) {
        stringBuilder.append(indent.repeat(numIndents)).append(line).append("\n");
    }

    public void addNewLine() {
        stringBuilder.append("\n");
    }

    public void beginControlFlow(String prefix) {
        stringBuilder.append(indent.repeat(numIndents) + prefix).append(" {\n");
        indent();
    }

    public void endControlFlow() {
        unIndent();
        addLine("}");
    }

    public String getContents() {
        return stringBuilder.toString();
    }
}
