package com.fern.interfaces;

import com.fern.NamedType;
import java.lang.String;

public interface IBaseService {
  NamedType name();

  String displayName();

  String basePath();
}
