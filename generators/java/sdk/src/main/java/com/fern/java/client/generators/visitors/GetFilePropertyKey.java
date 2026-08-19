package com.fern.java.client.generators.visitors;

import com.fern.ir.model.commons.NameAndWireValue;
import com.fern.ir.model.http.FileProperty;
import com.fern.ir.model.http.FilePropertyArray;
import com.fern.ir.model.http.FilePropertySingle;
import com.fern.java.utils.NameUtils;

public class GetFilePropertyKey implements FileProperty.Visitor<NameAndWireValue> {

    @Override
    public NameAndWireValue visitFile(FilePropertySingle file) {
        return NameUtils.toNameAndWireValue(file.getKey());
    }

    @Override
    public NameAndWireValue visitFileArray(FilePropertyArray fileArray) {
        return NameUtils.toNameAndWireValue(fileArray.getKey());
    }

    @Override
    public NameAndWireValue _visitUnknown(Object unknownType) {
        throw new RuntimeException("Encountered unknown file property key " + unknownType);
    }
}
