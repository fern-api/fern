package com.snippets;

import com.seed.examples.SeedExamplesClient;
import com.seed.examples.resources.commons.types.types.Data;
import com.seed.examples.resources.commons.types.types.EventInfo;
import com.seed.examples.resources.commons.types.types.Metadata;
import com.seed.examples.resources.types.types.Actor;
import com.seed.examples.resources.types.types.BigEntity;
import com.seed.examples.resources.types.types.CastMember;
import com.seed.examples.resources.types.types.Directory;
import com.seed.examples.resources.types.types.Entity;
import com.seed.examples.resources.types.types.Exception;
import com.seed.examples.resources.types.types.ExceptionInfo;
import com.seed.examples.resources.types.types.ExtendedMovie;
import com.seed.examples.resources.types.types.File;
import com.seed.examples.resources.types.types.Metadata;
import com.seed.examples.resources.types.types.Migration;
import com.seed.examples.resources.types.types.MigrationStatus;
import com.seed.examples.resources.types.types.Moment;
import com.seed.examples.resources.types.types.Node;
import com.seed.examples.resources.types.types.Test;
import com.seed.examples.resources.types.types.Tree;
import com.seed.examples.types.BasicType;
import com.seed.examples.types.Type;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.UUID;

public class Example18 {
    public static void main(String[] args) {
        SeedExamplesClient client = SeedExamplesClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.service().createBigEntity(
            BigEntity
                .builder()
                .castMember(
                    CastMember.ofActor(
                        Actor
                            .builder()
                            .name("name")
                            .id("id")
                            .build()
                    )
                )
                .extendedMovie(
                    ExtendedMovie
                        .builder()
                        .id("id")
                        .title("title")
                        .from("from")
                        .rating(1.1)
                        .type("movie")
                        .tag("tag")
                        .metadata(
                            new HashMap<String, Object>() {{
                                put("metadata", new 
                                HashMap<String, Object>() {{put("key", "value");
                                }});
                            }}
                        )
                        .revenue(1000000L)
                        .cast(
                            new ArrayList<String>(
                                Arrays.asList("cast", "cast")
                            )
                        )
                        .prequel("prequel")
                        .book("book")
                        .build()
                )
                .entity(
                    Entity
                        .builder()
                        .type(
                            Type.ofBasicType(BasicType.PRIMITIVE)
                        )
                        .name("name")
                        .build()
                )
                .metadata(
                    Metadata.html()
                )
                .commonMetadata(
                    Metadata
                        .builder()
                        .id("id")
                        .data(
                            new HashMap<String, String>() {{
                                put("data", "data");
                            }}
                        )
                        .jsonString("jsonString")
                        .build()
                )
                .eventInfo(
                    EventInfo.metadata(
                        Metadata
                            .builder()
                            .id("id")
                            .data(
                                new HashMap<String, String>() {{
                                    put("data", "data");
                                }}
                            )
                            .jsonString("jsonString")
                            .build()
                    )
                )
                .data(
                    Data.string()
                )
                .migration(
                    Migration
                        .builder()
                        .name("name")
                        .status(MigrationStatus.RUNNING)
                        .build()
                )
                .exception(
                    Exception.generic(
                        ExceptionInfo
                            .builder()
                            .exceptionType("exceptionType")
                            .exceptionMessage("exceptionMessage")
                            .exceptionStacktrace("exceptionStacktrace")
                            .build()
                    )
                )
                .test(
                    Test.and()
                )
                .node(
                    Node
                        .builder()
                        .name("name")
                        .nodes(
                            new ArrayList<Node>(
                                Arrays.asList(
                                    Node
                                        .builder()
                                        .name("name")
                                        .nodes(
                                            new ArrayList<Node>(
                                                Arrays.asList(
                                                    Node
                                                        .builder()
                                                        .name("name")
                                                        .nodes(
                                                            new ArrayList<Node>()
                                                        )
                                                        .trees(
                                                            new ArrayList<Tree>()
                                                        )
                                                        .build(),
                                                    Node
                                                        .builder()
                                                        .name("name")
                                                        .nodes(
                                                            new ArrayList<Node>()
                                                        )
                                                        .trees(
                                                            new ArrayList<Tree>()
                                                        )
                                                        .build()
                                                )
                                            )
                                        )
                                        .trees(
                                            new ArrayList<Tree>(
                                                Arrays.asList(
                                                    Tree
                                                        .builder()
                                                        .nodes(
                                                            new ArrayList<Node>()
                                                        )
                                                        .build(),
                                                    Tree
                                                        .builder()
                                                        .nodes(
                                                            new ArrayList<Node>()
                                                        )
                                                        .build()
                                                )
                                            )
                                        )
                                        .build(),
                                    Node
                                        .builder()
                                        .name("name")
                                        .nodes(
                                            new ArrayList<Node>(
                                                Arrays.asList(
                                                    Node
                                                        .builder()
                                                        .name("name")
                                                        .nodes(
                                                            new ArrayList<Node>()
                                                        )
                                                        .trees(
                                                            new ArrayList<Tree>()
                                                        )
                                                        .build(),
                                                    Node
                                                        .builder()
                                                        .name("name")
                                                        .nodes(
                                                            new ArrayList<Node>()
                                                        )
                                                        .trees(
                                                            new ArrayList<Tree>()
                                                        )
                                                        .build()
                                                )
                                            )
                                        )
                                        .trees(
                                            new ArrayList<Tree>(
                                                Arrays.asList(
                                                    Tree
                                                        .builder()
                                                        .nodes(
                                                            new ArrayList<Node>()
                                                        )
                                                        .build(),
                                                    Tree
                                                        .builder()
                                                        .nodes(
                                                            new ArrayList<Node>()
                                                        )
                                                        .build()
                                                )
                                            )
                                        )
                                        .build()
                                )
                            )
                        )
                        .trees(
                            new ArrayList<Tree>(
                                Arrays.asList(
                                    Tree
                                        .builder()
                                        .nodes(
                                            new ArrayList<Node>(
                                                Arrays.asList(
                                                    Node
                                                        .builder()
                                                        .name("name")
                                                        .nodes(
                                                            new ArrayList<Node>()
                                                        )
                                                        .trees(
                                                            new ArrayList<Tree>()
                                                        )
                                                        .build(),
                                                    Node
                                                        .builder()
                                                        .name("name")
                                                        .nodes(
                                                            new ArrayList<Node>()
                                                        )
                                                        .trees(
                                                            new ArrayList<Tree>()
                                                        )
                                                        .build()
                                                )
                                            )
                                        )
                                        .build(),
                                    Tree
                                        .builder()
                                        .nodes(
                                            new ArrayList<Node>(
                                                Arrays.asList(
                                                    Node
                                                        .builder()
                                                        .name("name")
                                                        .nodes(
                                                            new ArrayList<Node>()
                                                        )
                                                        .trees(
                                                            new ArrayList<Tree>()
                                                        )
                                                        .build(),
                                                    Node
                                                        .builder()
                                                        .name("name")
                                                        .nodes(
                                                            new ArrayList<Node>()
                                                        )
                                                        .trees(
                                                            new ArrayList<Tree>()
                                                        )
                                                        .build()
                                                )
                                            )
                                        )
                                        .build()
                                )
                            )
                        )
                        .build()
                )
                .directory(
                    Directory
                        .builder()
                        .name("name")
                        .files(
                            new ArrayList<File>(
                                Arrays.asList(
                                    File
                                        .builder()
                                        .name("name")
                                        .contents("contents")
                                        .build(),
                                    File
                                        .builder()
                                        .name("name")
                                        .contents("contents")
                                        .build()
                                )
                            )
                        )
                        .directories(
                            new ArrayList<Directory>(
                                Arrays.asList(
                                    Directory
                                        .builder()
                                        .name("name")
                                        .files(
                                            new ArrayList<File>(
                                                Arrays.asList(
                                                    File
                                                        .builder()
                                                        .name("name")
                                                        .contents("contents")
                                                        .build(),
                                                    File
                                                        .builder()
                                                        .name("name")
                                                        .contents("contents")
                                                        .build()
                                                )
                                            )
                                        )
                                        .directories(
                                            new ArrayList<Directory>(
                                                Arrays.asList(
                                                    Directory
                                                        .builder()
                                                        .name("name")
                                                        .files(
                                                            new ArrayList<File>()
                                                        )
                                                        .directories(
                                                            new ArrayList<Directory>()
                                                        )
                                                        .build(),
                                                    Directory
                                                        .builder()
                                                        .name("name")
                                                        .files(
                                                            new ArrayList<File>()
                                                        )
                                                        .directories(
                                                            new ArrayList<Directory>()
                                                        )
                                                        .build()
                                                )
                                            )
                                        )
                                        .build(),
                                    Directory
                                        .builder()
                                        .name("name")
                                        .files(
                                            new ArrayList<File>(
                                                Arrays.asList(
                                                    File
                                                        .builder()
                                                        .name("name")
                                                        .contents("contents")
                                                        .build(),
                                                    File
                                                        .builder()
                                                        .name("name")
                                                        .contents("contents")
                                                        .build()
                                                )
                                            )
                                        )
                                        .directories(
                                            new ArrayList<Directory>(
                                                Arrays.asList(
                                                    Directory
                                                        .builder()
                                                        .name("name")
                                                        .files(
                                                            new ArrayList<File>()
                                                        )
                                                        .directories(
                                                            new ArrayList<Directory>()
                                                        )
                                                        .build(),
                                                    Directory
                                                        .builder()
                                                        .name("name")
                                                        .files(
                                                            new ArrayList<File>()
                                                        )
                                                        .directories(
                                                            new ArrayList<Directory>()
                                                        )
                                                        .build()
                                                )
                                            )
                                        )
                                        .build()
                                )
                            )
                        )
                        .build()
                )
                .moment(
                    Moment
                        .builder()
                        .id(UUID.fromString("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"))
                        .date("2023-01-15")
                        .datetime(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                        .build()
                )
                .build()
        );
    }
}