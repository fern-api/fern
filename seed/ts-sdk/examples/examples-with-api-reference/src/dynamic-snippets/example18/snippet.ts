import { SeedExamplesClient } from "../..";

async function main() {
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
            id: "id",
            prequel: "prequel",
            title: "title",
            from: "from",
            rating: 1.1,
            type: "movie",
            tag: "tag",
            book: "book",
            metadata: {
                "metadata": {
                    key: "value",
                },
            },
            revenue: 1000000,
            cast: [
                "cast",
                "cast",
            ],
        },
        entity: {
            type: "primitive",
            name: "name",
        },
        metadata: {
            type: "html",
            extra: {
                "extra": "extra",
            },
            tags: new Set([
                "tags",
            ]),
            value: "metadata",
        },
        commonMetadata: {
            id: "id",
            data: {
                "data": "data",
            },
            jsonString: "jsonString",
        },
        eventInfo: {
            type: "metadata",
            id: "id",
            data: {
                "data": "data",
            },
            jsonString: "jsonString",
        },
        data: {
            type: "string",
            value: "data",
        },
        migration: {
            name: "name",
            status: "RUNNING",
        },
        exception: {
            type: "generic",
            exceptionType: "exceptionType",
            exceptionMessage: "exceptionMessage",
            exceptionStacktrace: "exceptionStacktrace",
        },
        test: {
            type: "and",
            value: true,
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
            datetime: new Date("2024-01-15T09:30:00Z"),
        },
    });
}
main();
