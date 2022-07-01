package com.fern.java.exception;

import java.rmi.RemoteException;

public final class UnknownRemoteException extends RemoteException {

    public UnknownRemoteException(String msg) {
        super(msg);
    }
}
