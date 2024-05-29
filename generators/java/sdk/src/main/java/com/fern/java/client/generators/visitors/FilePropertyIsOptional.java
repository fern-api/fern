package com.fern.java.client.generators.visitors;

import com.fern.irV42.model.http.FileProperty;
import com.fern.irV42.model.http.FilePropertyArray;
import com.fern.irV42.model.http.FilePropertySingle;

public class FilePropertyIsOptional implements FileProperty.Visitor<Boolean> {

    @Override
    public Boolean visitFile(FilePropertySingle file) {
        return file.getIsOptional();
    }

    @Override
    public Boolean visitFileArray(FilePropertyArray fileArray) {
        return fileArray.getIsOptional();
    }

    @Override
    public Boolean _visitUnknown(Object unknownType) {
        return false;
    }
}
