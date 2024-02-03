/*
 * (c) Copyright 2022 Birch Solutions Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
