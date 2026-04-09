package com.fern.java.client.generators.visitors;

import com.fern.ir.model.commons.NameAndWireValueOrString;
import com.fern.ir.model.http.FileProperty;
import com.fern.ir.model.http.FilePropertyArray;
import com.fern.ir.model.http.FilePropertySingle;

public class GetFilePropertyKey implements FileProperty.Visitor<NameAndWireValueOrString> {

    @Override
    public NameAndWireValueOrString visitFile(FilePropertySingle file) {
        return file.getKey();
    }

    @Override
    public NameAndWireValueOrString visitFileArray(FilePropertyArray fileArray) {
        return fileArray.getKey();
    }

    @Override
    public NameAndWireValueOrString _visitUnknown(Object unknownType) {
        throw new RuntimeException("Encountered unknown file property key " + unknownType);
    }
}
