package com.fern.java.exception;

import java.util.UUID;

public interface HttpException {

    int getStatusCode();

    default String getErrorInstanceId() {
        return UUID.randomUUID().toString();
    }
}
