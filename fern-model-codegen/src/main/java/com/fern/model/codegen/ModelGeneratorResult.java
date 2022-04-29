package com.fern.model.codegen;

import com.fern.codegen.GeneratedAlias;
import com.fern.codegen.GeneratedEnum;
import com.fern.codegen.GeneratedException;
import com.fern.codegen.GeneratedInterface;
import com.fern.codegen.GeneratedObject;
import com.fern.codegen.GeneratedUnion;
import com.types.NamedType;
import java.util.List;
import java.util.Map;
import org.immutables.value.Value;

@Value.Immutable
public interface ModelGeneratorResult {

    List<GeneratedAlias> aliases();

    List<GeneratedEnum> enums();

    Map<NamedType, GeneratedInterface> interfaces();

    List<GeneratedObject> objects();

    List<GeneratedUnion> unions();

    List<GeneratedException> exceptions();

    class Builder extends ImmutableModelGeneratorResult.Builder {}

    static ModelGeneratorResult.Builder builder() {
        return new ModelGeneratorResult.Builder();
    }
}
