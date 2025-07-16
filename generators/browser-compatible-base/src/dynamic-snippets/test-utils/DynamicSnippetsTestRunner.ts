import { FernIr } from '@fern-api/dynamic-ir-sdk'
import { AbsoluteFilePath, join } from '@fern-api/path-utils'

const DYNAMIC_IR_TEST_DEFINITIONS_DIRECTORY = AbsoluteFilePath.of(
    `${__dirname}/../../../../../packages/cli/generation/ir-generator-tests/src/dynamic-snippets/__test__/test-definitions`
)

// eslint-disable-next-line jest/no-export
export namespace DynamicSnippetsTestRunner {
    // eslint-disable-next-line jest/no-export
    export interface Args {
        buildGenerator: ({ irFilepath }: { irFilepath: AbsoluteFilePath }) => Generator
    }

    // eslint-disable-next-line jest/no-export
    export interface TestSuite {
        fixture: string
        generator: Generator
        testCases: TestCase[]
    }

    interface Generator {
        generate: (request: FernIr.dynamic.EndpointSnippetRequest) => Promise<FernIr.dynamic.EndpointSnippetResponse>
    }

    interface TestCase {
        description: string
        giveRequest: FernIr.dynamic.EndpointSnippetRequest
    }
}

// eslint-disable-next-line jest/no-export
export class DynamicSnippetsTestRunner {
    public runTests(args: DynamicSnippetsTestRunner.Args): void {
        this.runExamplesTests(args)
        this.runExhaustiveTests(args)
        this.runFileUploadTests(args)
        this.runImdbTests(args)
        this.runMultiUrlEnvironmentTests(args)
        this.runNullableTests(args)
        this.runSingleUrlEnvironmentDefaultTests(args)
    }

    private runExamplesTests(args: DynamicSnippetsTestRunner.Args): void {
        const generator = args.buildGenerator({
            irFilepath: AbsoluteFilePath.of(join(DYNAMIC_IR_TEST_DEFINITIONS_DIRECTORY, 'examples.json'))
        })
        this.runDynamicSnippetTests({
            fixture: 'examples',
            generator,
            testCases: [
                {
                    description: 'GET /metadata (simple)',
                    giveRequest: {
                        endpoint: {
                            method: 'GET',
                            path: '/metadata'
                        },
                        baseURL: undefined,
                        environment: undefined,
                        auth: {
                            type: 'bearer',
                            token: '<YOUR_API_KEY>'
                        },
                        pathParameters: undefined,
                        queryParameters: {
                            shallow: false,
                            tag: 'development'
                        },
                        headers: {
                            'X-API-Version': '0.0.1'
                        },
                        requestBody: undefined
                    }
                },
                {
                    description: 'GET /metadata (allow-multiple)',
                    giveRequest: {
                        endpoint: {
                            method: 'GET',
                            path: '/metadata'
                        },
                        baseURL: undefined,
                        environment: undefined,
                        auth: {
                            type: 'bearer',
                            token: '<YOUR_API_KEY>'
                        },
                        pathParameters: undefined,
                        queryParameters: {
                            shallow: false,
                            tag: ['development', 'public']
                        },
                        headers: {
                            'X-API-Version': '0.0.1'
                        },
                        requestBody: undefined
                    }
                },
                {
                    description: 'POST /movie (simple)',
                    giveRequest: {
                        endpoint: {
                            method: 'POST',
                            path: '/movie'
                        },
                        baseURL: undefined,
                        environment: undefined,
                        auth: {
                            type: 'bearer',
                            token: '<YOUR_API_KEY>'
                        },
                        pathParameters: undefined,
                        queryParameters: undefined,
                        headers: undefined,
                        requestBody: {
                            id: 'movie-c06a4ad7',
                            prequel: 'movie-cv9b914f',
                            title: 'The Boy and the Heron',
                            from: 'Hayao Miyazaki',
                            rating: 8.0,
                            type: 'movie',
                            tag: 'development',
                            metadata: {
                                actors: ['Christian Bale', 'Florence Pugh', 'Willem Dafoe'],
                                releaseDate: '2023-12-08',
                                ratings: {
                                    rottenTomatoes: 97,
                                    imdb: 7.6
                                }
                            },
                            revenue: 1000000
                        }
                    }
                },
                {
                    description: 'POST /big-entity (simple)',
                    giveRequest: {
                        endpoint: {
                            method: 'POST',
                            path: '/big-entity'
                        },
                        baseURL: undefined,
                        environment: undefined,
                        auth: {
                            type: 'bearer',
                            token: '<YOUR_API_KEY>'
                        },
                        pathParameters: undefined,
                        queryParameters: undefined,
                        headers: undefined,
                        requestBody: {
                            castMember: {
                                id: 'john.doe',
                                name: 'John Doe'
                            },
                            extendedMovie: {
                                cast: ['John Travolta', 'Samuel L. Jackson', 'Uma Thurman', 'Bruce Willis'],
                                id: 'movie-sda231x',
                                title: 'Pulp Fiction',
                                from: 'Quentin Tarantino',
                                rating: 8.5,
                                type: 'movie',
                                tag: 'tag-12efs9dv',
                                metadata: {
                                    academyAward: true,
                                    releaseDate: '2023-12-08',
                                    ratings: {
                                        rottenTomatoes: 97,
                                        imdb: 7.6
                                    }
                                },
                                revenue: 1000000
                            }
                        }
                    }
                },
                {
                    description: 'POST /movie (invalid request body)',
                    giveRequest: {
                        endpoint: {
                            method: 'POST',
                            path: '/movie'
                        },
                        baseURL: undefined,
                        environment: undefined,
                        auth: {
                            type: 'bearer',
                            token: '<YOUR_API_KEY>'
                        },
                        pathParameters: undefined,
                        queryParameters: undefined,
                        headers: undefined,
                        requestBody: {
                            id: 'movie-c06a4ad7',
                            prequel: 'movie-cv9b914f',
                            title: 42, // invalid
                            from: 'Hayao Miyazaki',
                            rating: 8.0,
                            type: 'movie',
                            tag: 'development',
                            metadata: {
                                actors: ['Christian Bale', 'Florence Pugh', 'Willem Dafoe'],
                                releaseDate: '2023-12-08',
                                ratings: {
                                    rottenTomatoes: 97,
                                    imdb: 7.6
                                }
                            },
                            revenue: 1000000
                        }
                    }
                }
            ]
        })
    }

    private runExhaustiveTests(args: DynamicSnippetsTestRunner.Args): void {
        const generator = args.buildGenerator({
            irFilepath: AbsoluteFilePath.of(join(DYNAMIC_IR_TEST_DEFINITIONS_DIRECTORY, 'exhaustive.json'))
        })
        this.runDynamicSnippetTests({
            fixture: 'exhaustive',
            generator,
            testCases: [
                {
                    description: 'POST /container/list-of-primitives (simple)',
                    giveRequest: {
                        endpoint: {
                            method: 'POST',
                            path: '/container/list-of-primitives'
                        },
                        baseURL: undefined,
                        environment: undefined,
                        auth: {
                            type: 'bearer',
                            token: '<YOUR_API_KEY>'
                        },
                        pathParameters: undefined,
                        queryParameters: undefined,
                        headers: undefined,
                        requestBody: ['one', 'two', 'three']
                    }
                },
                {
                    description: 'POST /container/list-of-objects (simple)',
                    giveRequest: {
                        endpoint: {
                            method: 'POST',
                            path: '/container/list-of-objects'
                        },
                        baseURL: undefined,
                        environment: undefined,
                        auth: {
                            type: 'bearer',
                            token: '<YOUR_API_KEY>'
                        },
                        pathParameters: undefined,
                        queryParameters: undefined,
                        headers: undefined,
                        requestBody: [
                            {
                                string: 'one'
                            },
                            {
                                string: 'two'
                            },
                            {
                                string: 'three'
                            }
                        ]
                    }
                },
                {
                    description: 'POST /container/list-of-objects (invalid request body)',
                    giveRequest: {
                        endpoint: {
                            method: 'POST',
                            path: '/container/list-of-objects'
                        },
                        baseURL: undefined,
                        environment: undefined,
                        auth: {
                            type: 'bearer',
                            token: '<YOUR_API_KEY>'
                        },
                        pathParameters: undefined,
                        queryParameters: undefined,
                        headers: undefined,
                        requestBody: [
                            {
                                string: true
                            },
                            {
                                invalid: 'two'
                            },
                            {
                                string: 42
                            }
                        ]
                    }
                },
                {
                    description: 'GET /object/get-and-return-with-optional-field',
                    giveRequest: {
                        endpoint: {
                            method: 'POST',
                            path: '/object/get-and-return-with-optional-field'
                        },
                        baseURL: undefined,
                        environment: undefined,
                        auth: {
                            type: 'bearer',
                            token: '<YOUR_API_KEY>'
                        },
                        pathParameters: undefined,
                        queryParameters: undefined,
                        headers: undefined,
                        requestBody: {
                            string: 'string',
                            integer: 1,
                            long: 1000000,
                            double: 1.1,
                            bool: true,
                            datetime: '2024-01-15T09:30:00Z',
                            date: '2023-01-15',
                            uuid: 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
                            base64: 'SGVsbG8gd29ybGQh',
                            list: ['list', 'list'],
                            set: ['set'],
                            map: {
                                1: 'map'
                            },
                            bigint: '1000000'
                        }
                    }
                }
            ]
        })
    }

    private runFileUploadTests(args: DynamicSnippetsTestRunner.Args): void {
        const generator = args.buildGenerator({
            irFilepath: AbsoluteFilePath.of(join(DYNAMIC_IR_TEST_DEFINITIONS_DIRECTORY, 'file-upload.json'))
        })
        this.runDynamicSnippetTests({
            fixture: 'file-upload',
            generator,
            testCases: [
                {
                    description: 'POST /',
                    giveRequest: {
                        endpoint: {
                            method: 'POST',
                            path: '/'
                        },
                        baseURL: undefined,
                        environment: undefined,
                        auth: undefined,
                        pathParameters: undefined,
                        queryParameters: undefined,
                        headers: undefined,
                        requestBody: {
                            file: 'Hello, world!',
                            file_list: ['First', 'Second']
                        }
                    }
                },
                {
                    description: 'POST /just-file',
                    giveRequest: {
                        endpoint: {
                            method: 'POST',
                            path: '/just-file'
                        },
                        baseURL: undefined,
                        environment: undefined,
                        auth: undefined,
                        pathParameters: undefined,
                        queryParameters: undefined,
                        headers: undefined,
                        requestBody: {
                            file: 'Hello, world!'
                        }
                    }
                },
                {
                    description: 'POST /just-file-with-query-params',
                    giveRequest: {
                        endpoint: {
                            method: 'POST',
                            path: '/just-file-with-query-params'
                        },
                        baseURL: undefined,
                        environment: undefined,
                        auth: undefined,
                        pathParameters: undefined,
                        queryParameters: {
                            integer: 42,
                            maybeString: 'exists'
                        },
                        headers: undefined,
                        requestBody: {
                            file: 'Hello, world!'
                        }
                    }
                }
            ]
        })
    }

    private runImdbTests(args: DynamicSnippetsTestRunner.Args): void {
        const generator = args.buildGenerator({
            irFilepath: AbsoluteFilePath.of(join(DYNAMIC_IR_TEST_DEFINITIONS_DIRECTORY, 'imdb.json'))
        })
        this.runDynamicSnippetTests({
            fixture: 'imdb',
            generator,
            testCases: [
                {
                    description: 'GET /movies/{movieId} (simple)',
                    giveRequest: {
                        endpoint: {
                            method: 'GET',
                            path: '/movies/{movieId}'
                        },
                        baseURL: undefined,
                        environment: undefined,
                        auth: {
                            type: 'bearer',
                            token: '<YOUR_API_KEY>'
                        },
                        pathParameters: {
                            movieId: 'movie_xyz'
                        },
                        queryParameters: undefined,
                        headers: undefined,
                        requestBody: undefined
                    }
                },
                {
                    description: 'POST /movies/create-movie (simple)',
                    giveRequest: {
                        endpoint: {
                            method: 'POST',
                            path: '/movies/create-movie'
                        },
                        baseURL: undefined,
                        environment: undefined,
                        auth: {
                            type: 'bearer',
                            token: '<YOUR_API_KEY>'
                        },
                        pathParameters: undefined,
                        queryParameters: undefined,
                        headers: undefined,
                        requestBody: {
                            title: 'The Matrix',
                            rating: 8.2
                        }
                    }
                }
            ]
        })
    }

    private runMultiUrlEnvironmentTests(args: DynamicSnippetsTestRunner.Args): void {
        const generator = args.buildGenerator({
            irFilepath: AbsoluteFilePath.of(join(DYNAMIC_IR_TEST_DEFINITIONS_DIRECTORY, 'multi-url-environment.json'))
        })
        this.runDynamicSnippetTests({
            fixture: 'multi-url-environment',
            generator,
            testCases: [
                {
                    description: 'Production environment',
                    giveRequest: {
                        endpoint: {
                            method: 'POST',
                            path: '/s3/presigned-url'
                        },
                        auth: {
                            type: 'bearer',
                            token: '<YOUR_API_KEY>'
                        },
                        baseURL: undefined,
                        environment: 'Production',
                        pathParameters: undefined,
                        queryParameters: undefined,
                        headers: undefined,
                        requestBody: {
                            s3Key: 'xyz'
                        }
                    }
                },
                {
                    description: 'Staging environment',
                    giveRequest: {
                        endpoint: {
                            method: 'POST',
                            path: '/s3/presigned-url'
                        },
                        auth: {
                            type: 'bearer',
                            token: '<YOUR_API_KEY>'
                        },
                        baseURL: undefined,
                        environment: 'Staging',
                        pathParameters: undefined,
                        queryParameters: undefined,
                        headers: undefined,
                        requestBody: {
                            s3Key: 'xyz'
                        }
                    }
                },
                {
                    description: 'Custom environment',
                    giveRequest: {
                        endpoint: {
                            method: 'POST',
                            path: '/s3/presigned-url'
                        },
                        auth: {
                            type: 'bearer',
                            token: '<YOUR_API_KEY>'
                        },
                        baseURL: undefined,
                        environment: {
                            ec2: 'https://custom.ec2.aws.com',
                            s3: 'https://custom.s3.aws.com'
                        },
                        pathParameters: undefined,
                        queryParameters: undefined,
                        headers: undefined,
                        requestBody: {
                            s3Key: 'xyz'
                        }
                    }
                },
                {
                    description: 'Unrecognized environment',
                    giveRequest: {
                        endpoint: {
                            method: 'POST',
                            path: '/s3/presigned-url'
                        },
                        auth: {
                            type: 'bearer',
                            token: '<YOUR_API_KEY>'
                        },
                        baseURL: undefined,
                        environment: 'Unrecognized',
                        pathParameters: undefined,
                        queryParameters: undefined,
                        headers: undefined,
                        requestBody: {
                            s3Key: 'xyz'
                        }
                    }
                },
                {
                    description: 'Invalid multi url environment',
                    giveRequest: {
                        endpoint: {
                            method: 'POST',
                            path: '/s3/presigned-url'
                        },
                        auth: {
                            type: 'bearer',
                            token: '<YOUR_API_KEY>'
                        },
                        baseURL: undefined,
                        environment: {
                            ec2: 'https://custom.ec2.aws.com'
                        },
                        pathParameters: undefined,
                        queryParameters: undefined,
                        headers: undefined,
                        requestBody: {
                            s3Key: 'xyz'
                        }
                    }
                }
            ]
        })
    }

    private runNullableTests(args: DynamicSnippetsTestRunner.Args): void {
        const generator = args.buildGenerator({
            irFilepath: AbsoluteFilePath.of(join(DYNAMIC_IR_TEST_DEFINITIONS_DIRECTORY, 'nullable.json'))
        })
        this.runDynamicSnippetTests({
            fixture: 'nullable',
            generator,
            testCases: [
                {
                    description: 'Query parameters',
                    giveRequest: {
                        endpoint: {
                            method: 'GET',
                            path: '/users'
                        },
                        auth: undefined,
                        baseURL: 'https://api.example.com',
                        environment: undefined,
                        pathParameters: undefined,
                        queryParameters: {
                            usernames: ['john.doe', 'jane.doe'],
                            tags: [null],
                            extra: null
                        },
                        headers: undefined,
                        requestBody: undefined
                    }
                },
                {
                    description: 'Body properties',
                    giveRequest: {
                        endpoint: {
                            method: 'POST',
                            path: '/users'
                        },
                        auth: undefined,
                        baseURL: 'https://api.example.com',
                        environment: undefined,
                        pathParameters: undefined,
                        queryParameters: undefined,
                        headers: undefined,
                        requestBody: {
                            username: 'john.doe',
                            tags: ['admin'],
                            metadata: {
                                createdAt: '1980-01-01T00:00:00Z',
                                updatedAt: '1980-01-01T00:00:00Z',
                                avatar: null,
                                activated: null
                            },
                            avatar: null
                        }
                    }
                },
                {
                    description: 'Invalid null value',
                    giveRequest: {
                        endpoint: {
                            method: 'POST',
                            path: '/users'
                        },
                        auth: undefined,
                        baseURL: 'https://api.example.com',
                        environment: undefined,
                        pathParameters: undefined,
                        queryParameters: undefined,
                        headers: undefined,
                        requestBody: {
                            username: null
                        }
                    }
                }
            ]
        })
    }

    private runSingleUrlEnvironmentDefaultTests(args: DynamicSnippetsTestRunner.Args): void {
        const generator = args.buildGenerator({
            irFilepath: AbsoluteFilePath.of(
                join(DYNAMIC_IR_TEST_DEFINITIONS_DIRECTORY, 'single-url-environment-default.json')
            )
        })
        this.runDynamicSnippetTests({
            fixture: 'single-url-environment-default',
            generator,
            testCases: [
                {
                    description: 'Production environment',
                    giveRequest: {
                        endpoint: {
                            method: 'GET',
                            path: '/dummy'
                        },
                        auth: {
                            type: 'bearer',
                            token: '<YOUR_API_KEY>'
                        },
                        baseURL: undefined,
                        environment: 'Production',
                        pathParameters: undefined,
                        queryParameters: undefined,
                        headers: undefined,
                        requestBody: undefined
                    }
                },
                {
                    description: 'Staging environment',
                    giveRequest: {
                        endpoint: {
                            method: 'GET',
                            path: '/dummy'
                        },
                        auth: {
                            type: 'bearer',
                            token: '<YOUR_API_KEY>'
                        },
                        baseURL: undefined,
                        environment: 'Staging',
                        pathParameters: undefined,
                        queryParameters: undefined,
                        headers: undefined,
                        requestBody: undefined
                    }
                },
                {
                    description: 'custom baseURL',
                    giveRequest: {
                        endpoint: {
                            method: 'GET',
                            path: '/dummy'
                        },
                        auth: {
                            type: 'bearer',
                            token: '<YOUR_API_KEY>'
                        },
                        baseURL: 'http://localhost:8080',
                        environment: undefined,
                        pathParameters: undefined,
                        queryParameters: undefined,
                        headers: undefined,
                        requestBody: undefined
                    }
                },
                {
                    description: 'invalid environment',
                    giveRequest: {
                        endpoint: {
                            method: 'GET',
                            path: '/dummy'
                        },
                        auth: {
                            type: 'bearer',
                            token: '<YOUR_API_KEY>'
                        },
                        baseURL: undefined,
                        environment: 'Unrecognized',
                        pathParameters: undefined,
                        queryParameters: undefined,
                        headers: undefined,
                        requestBody: undefined
                    }
                },
                {
                    description: 'invalid baseURL and environment',
                    giveRequest: {
                        endpoint: {
                            method: 'GET',
                            path: '/dummy'
                        },
                        auth: {
                            type: 'bearer',
                            token: '<YOUR_API_KEY>'
                        },
                        baseURL: 'http://localhost:8080',
                        environment: 'Production',
                        pathParameters: undefined,
                        queryParameters: undefined,
                        headers: undefined,
                        requestBody: undefined
                    }
                }
            ]
        })
    }

    private runDynamicSnippetTests(testSuite: DynamicSnippetsTestRunner.TestSuite) {
        describe(testSuite.fixture, () => {
            test.each(testSuite.testCases)('$description', async ({ giveRequest }) => {
                const response = await testSuite.generator.generate(giveRequest)
                expect(formatResult(response)).toMatchSnapshot()
            })
        })
    }
}

function formatResult(response: FernIr.dynamic.EndpointSnippetResponse): string {
    if (response.errors != null) {
        return JSON.stringify(response.errors, null, 2)
    }
    return response.snippet
}
