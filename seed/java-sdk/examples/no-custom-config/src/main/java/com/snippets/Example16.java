package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.service.requests.BigEntity;
import com.seed.api.types.Actor;
import com.seed.api.types.BasicType;
import com.seed.api.types.CastMember;
import com.seed.api.types.CommonsData;
import com.seed.api.types.CommonsDataString;
import com.seed.api.types.CommonsEventInfo;
import com.seed.api.types.CommonsEventInfoZero;
import com.seed.api.types.CommonsEventInfoZeroType;
import com.seed.api.types.CommonsMetadata;
import com.seed.api.types.Directory;
import com.seed.api.types.Entity;
import com.seed.api.types.Exception;
import com.seed.api.types.ExceptionZero;
import com.seed.api.types.ExceptionZeroType;
import com.seed.api.types.ExtendedMovie;
import com.seed.api.types.File;
import com.seed.api.types.Metadata;
import com.seed.api.types.MetadataHtml;
import com.seed.api.types.Migration;
import com.seed.api.types.MigrationStatus;
import com.seed.api.types.Moment;
import com.seed.api.types.MovieType;
import com.seed.api.types.Node;
import com.seed.api.types.Test;
import com.seed.api.types.TestAnd;
import com.seed.api.types.Tree;
import com.seed.api.types.Type;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Optional;

public class Example16 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.service()
                .createbigentity(BigEntity.builder()
                        .castMember(CastMember.of(
                                Actor.builder().name("name").id("id").build()))
                        .extendedMovie(ExtendedMovie.builder()
                                .id("id")
                                .title("title")
                                .from("from")
                                .rating(1.1)
                                .type(MovieType.MOVIE)
                                .tag("tag")
                                .revenue(1000000L)
                                .prequel("prequel")
                                .book("book")
                                .metadata(new HashMap<String, Object>() {
                                    {
                                        put("metadata", new HashMap<String, Object>() {
                                            {
                                                put("key", "value");
                                            }
                                        });
                                    }
                                })
                                .cast(Arrays.asList("cast", "cast"))
                                .build())
                        .entity(Entity.builder()
                                .type(Type.of(BasicType.PRIMITIVE))
                                .name("name")
                                .build())
                        .metadata(Metadata.html(
                                MetadataHtml.builder().value("value").build()))
                        .commonMetadata(CommonsMetadata.builder()
                                .id("id")
                                .data(new HashMap<String, Optional<String>>() {
                                    {
                                        put("data", Optional.of("data"));
                                    }
                                })
                                .jsonString("jsonString")
                                .build())
                        .eventInfo(CommonsEventInfo.of(CommonsEventInfoZero.builder()
                                .id("id")
                                .type(CommonsEventInfoZeroType.METADATA)
                                .data(Optional.of(new HashMap<String, Optional<String>>() {
                                    {
                                        put("data", Optional.of("data"));
                                    }
                                }))
                                .jsonString(Optional.of("jsonString"))
                                .build()))
                        .data(CommonsData.string(
                                CommonsDataString.builder().value("value").build()))
                        .migration(Migration.builder()
                                .name("name")
                                .status(MigrationStatus.RUNNING)
                                .build())
                        .exception(Exception.of(ExceptionZero.builder()
                                .exceptionType("exceptionType")
                                .exceptionMessage("exceptionMessage")
                                .exceptionStacktrace("exceptionStacktrace")
                                .type(ExceptionZeroType.GENERIC)
                                .build()))
                        .test(Test.and(TestAnd.builder().value(true).build()))
                        .node(Node.builder()
                                .name("name")
                                .nodes(Optional.of(Arrays.asList(
                                        Node.builder()
                                                .name("name")
                                                .nodes(Optional.of(Arrays.asList(
                                                        Node.builder()
                                                                .name("name")
                                                                .build(),
                                                        Node.builder()
                                                                .name("name")
                                                                .build())))
                                                .trees(Optional.of(Arrays.asList(
                                                        Tree.builder().build(),
                                                        Tree.builder().build())))
                                                .build(),
                                        Node.builder()
                                                .name("name")
                                                .nodes(Optional.of(Arrays.asList(
                                                        Node.builder()
                                                                .name("name")
                                                                .build(),
                                                        Node.builder()
                                                                .name("name")
                                                                .build())))
                                                .trees(Optional.of(Arrays.asList(
                                                        Tree.builder().build(),
                                                        Tree.builder().build())))
                                                .build())))
                                .trees(Optional.of(Arrays.asList(
                                        Tree.builder()
                                                .nodes(Optional.of(new ArrayList<Node>()))
                                                .build(),
                                        Tree.builder()
                                                .nodes(Optional.of(new ArrayList<Node>()))
                                                .build())))
                                .build())
                        .directory(Directory.builder()
                                .name("name")
                                .files(Optional.of(Arrays.asList(
                                        File.builder()
                                                .name("name")
                                                .contents("contents")
                                                .build(),
                                        File.builder()
                                                .name("name")
                                                .contents("contents")
                                                .build())))
                                .directories(Optional.of(Arrays.asList(
                                        Directory.builder()
                                                .name("name")
                                                .files(Optional.of(new ArrayList<File>()))
                                                .directories(Optional.of(Arrays.asList(
                                                        Directory.builder()
                                                                .name("name")
                                                                .build(),
                                                        Directory.builder()
                                                                .name("name")
                                                                .build())))
                                                .build(),
                                        Directory.builder()
                                                .name("name")
                                                .files(Optional.of(new ArrayList<File>()))
                                                .directories(Optional.of(Arrays.asList(
                                                        Directory.builder()
                                                                .name("name")
                                                                .build(),
                                                        Directory.builder()
                                                                .name("name")
                                                                .build())))
                                                .build())))
                                .build())
                        .moment(Moment.builder()
                                .id("id")
                                .date("2023-01-15")
                                .datetime(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                                .build())
                        .build());
    }
}
