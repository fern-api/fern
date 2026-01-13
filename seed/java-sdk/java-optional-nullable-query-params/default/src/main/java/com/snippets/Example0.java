package com.snippets;

import com.seed.javaOptionalNullableQueryParams.SeedJavaOptionalNullableQueryParamsClient;
import com.seed.javaOptionalNullableQueryParams.core.OptionalNullable;
import com.seed.javaOptionalNullableQueryParams.requests.SearchRequest;
import com.seed.javaOptionalNullableQueryParams.types.SortOrder;

public class Example0 {
    public static void main(String[] args) {
        SeedJavaOptionalNullableQueryParamsClient client = SeedJavaOptionalNullableQueryParamsClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.search(
            SearchRequest
                .builder()
                .query(
                    OptionalNullable.of("")
                )
                .limit(
                    OptionalNullable.of(1)
                )
                .includeArchived(
                    OptionalNullable.of(true)
                )
                .sortOrder(
                    OptionalNullable.of(SortOrder.ASC)
                )
                .optionalWithoutDefault(
                    OptionalNullable.of("optionalWithoutDefault")
                )
                .regularOptional(
                    OptionalNullable.of("default-value")
                )
                .regularOptionalNoDefault(
                    OptionalNullable.of("regularOptionalNoDefault")
                )
                .build()
        );
    }
}