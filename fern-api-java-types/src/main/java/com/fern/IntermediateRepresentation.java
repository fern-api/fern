package com.fern;

import org.immutables.value.Value;

import java.util.List;

@Value.Immutable
public interface IntermediateRepresentation {

    List<Object> types();

    List<Object> services();
}
