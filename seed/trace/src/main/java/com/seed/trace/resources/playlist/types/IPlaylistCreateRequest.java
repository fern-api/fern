package com.seed.trace.resources.playlist.types;

import java.util.List;

public interface IPlaylistCreateRequest {
    String getName();

    List<String> getProblems();
}
