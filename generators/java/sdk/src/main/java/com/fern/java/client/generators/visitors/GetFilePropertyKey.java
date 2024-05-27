package com.fern.java.client.generators.visitors;

import com.fern.irV42.model.commons.NameAndWireValue;
import com.fern.irV42.model.http.FileProperty;
import com.fern.irV42.model.http.FilePropertyArray;
import com.fern.irV42.model.http.FilePropertySingle;

public class GetFilePropertyKey implements FileProperty.Visitor<NameAndWireValue> {

    @Override
    public NameAndWireValue visitFile(FilePropertySingle file) {
        return file.getKey();
    }

    @Override
    public NameAndWireValue visitFileArray(FilePropertyArray fileArray) {
        return fileArray.getKey();
    }

    @Override
    public NameAndWireValue _visitUnknown(Object unknownType) {
        throw new RuntimeException("Encountered unknown file property key " + unknownType);
    }
}
