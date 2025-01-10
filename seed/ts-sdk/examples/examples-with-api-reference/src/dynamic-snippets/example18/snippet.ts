import { SeedExamplesClient } from "../..";

async function main(): Promise<void> {
    const client = new SeedExamplesClient({
        environment: "https://api.fern.com",
        token: "<token>",
    });
    
    await client.service.createBigEntity({
        castMember: {
            name: "name",
            id: "id",
        },
        extendedMovie: {
            cast: [
                "cast",
                "cast",
            ],
        },
        entity: {
            type_: "primitive",
            name: "name",
        },
        metadata: {
            html: "html",
        },
        commonMetadata: {
            id: "id",
            data: {
                data: "data",
            },
            jsonString: "jsonString",
        },
        eventInfo: {
            metadata: "metadata",
            metadata: {
                id: "id",
                data: {
                    data: "data",
                },
                jsonString: "jsonString",
            },
        },
        data: {
            string_: "string",
        },
        migration: {
            name: "name",
            status: "RUNNING",
        },
        exception: {
            generic: "generic",
            generic: {
                exceptionType: "exceptionType",
                exceptionMessage: "exceptionMessage",
                exceptionStacktrace: "exceptionStacktrace",
            },
        },
        test: {
            and: "and",
        },
        node: {
            name: "name",
            nodes: [
                {
                    name: "name",
                    nodes: [
                        {
                            name: "name",
                            nodes: [],
                            trees: [],
                        },
                        {
                            name: "name",
                            nodes: [],
                            trees: [],
                        },
                    ],
                    trees: [
                        {
                            nodes: [],
                        },
                        {
                            nodes: [],
                        },
                    ],
                },
                {
                    name: "name",
                    nodes: [
                        {
                            name: "name",
                            nodes: [],
                            trees: [],
                        },
                        {
                            name: "name",
                            nodes: [],
                            trees: [],
                        },
                    ],
                    trees: [
                        {
                            nodes: [],
                        },
                        {
                            nodes: [],
                        },
                    ],
                },
            ],
            trees: [
                {
                    nodes: [
                        {
                            name: "name",
                            nodes: [],
                            trees: [],
                        },
                        {
                            name: "name",
                            nodes: [],
                            trees: [],
                        },
                    ],
                },
                {
                    nodes: [
                        {
                            name: "name",
                            nodes: [],
                            trees: [],
                        },
                        {
                            name: "name",
                            nodes: [],
                            trees: [],
                        },
                    ],
                },
            ],
        },
        directory: {
            name: "name",
            files: [
                {
                    name: "name",
                    contents: "contents",
                },
                {
                    name: "name",
                    contents: "contents",
                },
            ],
            directories: [
                {
                    name: "name",
                    files: [
                        {
                            name: "name",
                            contents: "contents",
                        },
                        {
                            name: "name",
                            contents: "contents",
                        },
                    ],
                    directories: [
                        {
                            name: "name",
                            files: [],
                            directories: [],
                        },
                        {
                            name: "name",
                            files: [],
                            directories: [],
                        },
                    ],
                },
                {
                    name: "name",
                    files: [
                        {
                            name: "name",
                            contents: "contents",
                        },
                        {
                            name: "name",
                            contents: "contents",
                        },
                    ],
                    directories: [
                        {
                            name: "name",
                            files: [],
                            directories: [],
                        },
                        {
                            name: "name",
                            files: [],
                            directories: [],
                        },
                    ],
                },
            ],
        },
        moment: {
            id: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
            date: "2023-01-15",
            datetime: "2024-01-15T09:30:00Z",
        },
    });
}
main();
