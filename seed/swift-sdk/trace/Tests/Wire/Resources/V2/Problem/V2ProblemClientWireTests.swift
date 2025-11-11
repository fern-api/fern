import Foundation
import Testing
import Trace

@Suite("V2ProblemClient Wire Tests") struct V2ProblemClientWireTests {
    @Test func getLightweightProblems1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                [
                  {
                    "problemId": "problemId",
                    "problemName": "problemName",
                    "problemVersion": 1,
                    "variableTypes": [
                      {
                        "type": "integerType"
                      }
                    ]
                  },
                  {
                    "problemId": "problemId",
                    "problemName": "problemName",
                    "problemVersion": 1,
                    "variableTypes": [
                      {
                        "type": "integerType"
                      }
                    ]
                  }
                ]
                """.utf8
            )
        )
        let client = TraceClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            LightweightProblemInfoV2(
                problemId: "problemId",
                problemName: "problemName",
                problemVersion: 1,
                variableTypes: []
            ),
            LightweightProblemInfoV2(
                problemId: "problemId",
                problemName: "problemName",
                problemVersion: 1,
                variableTypes: []
            )
        ]
        let response = try await client.v2.problem.getLightweightProblems(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func getProblems1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                [
                  {
                    "problemId": "problemId",
                    "problemDescription": {
                      "boards": [
                        {
                          "type": "html",
                          "value": "boards"
                        },
                        {
                          "type": "html",
                          "value": "boards"
                        }
                      ]
                    },
                    "problemName": "problemName",
                    "problemVersion": 1,
                    "supportedLanguages": [
                      "JAVA"
                    ],
                    "customFiles": {
                      "type": "basic",
                      "methodName": "methodName",
                      "signature": {
                        "parameters": [
                          {
                            "parameterId": "parameterId",
                            "name": "name",
                            "variableType": {
                              "type": "integerType"
                            }
                          },
                          {
                            "parameterId": "parameterId",
                            "name": "name",
                            "variableType": {
                              "type": "integerType"
                            }
                          }
                        ],
                        "returnType": {
                          "type": "integerType"
                        }
                      },
                      "additionalFiles": {
                        "JAVA": {
                          "files": [
                            {
                              "filename": "filename",
                              "directory": "directory",
                              "contents": "contents",
                              "editable": true
                            },
                            {
                              "filename": "filename",
                              "directory": "directory",
                              "contents": "contents",
                              "editable": true
                            }
                          ]
                        }
                      },
                      "basicTestCaseTemplate": {
                        "templateId": "templateId",
                        "name": "name",
                        "description": {
                          "boards": [
                            {
                              "type": "html",
                              "value": "boards"
                            },
                            {
                              "type": "html",
                              "value": "boards"
                            }
                          ]
                        },
                        "expectedValueParameterId": "expectedValueParameterId"
                      }
                    },
                    "generatedFiles": {
                      "generatedTestCaseFiles": {
                        "JAVA": {
                          "files": [
                            {
                              "filename": "filename",
                              "directory": "directory",
                              "contents": "contents",
                              "editable": true
                            },
                            {
                              "filename": "filename",
                              "directory": "directory",
                              "contents": "contents",
                              "editable": true
                            }
                          ]
                        }
                      },
                      "generatedTemplateFiles": {
                        "JAVA": {
                          "files": [
                            {
                              "filename": "filename",
                              "directory": "directory",
                              "contents": "contents",
                              "editable": true
                            },
                            {
                              "filename": "filename",
                              "directory": "directory",
                              "contents": "contents",
                              "editable": true
                            }
                          ]
                        }
                      },
                      "other": {
                        "JAVA": {
                          "files": [
                            {
                              "filename": "filename",
                              "directory": "directory",
                              "contents": "contents",
                              "editable": true
                            },
                            {
                              "filename": "filename",
                              "directory": "directory",
                              "contents": "contents",
                              "editable": true
                            }
                          ]
                        }
                      }
                    },
                    "customTestCaseTemplates": [
                      {
                        "templateId": "templateId",
                        "name": "name",
                        "implementation": {
                          "description": {
                            "boards": [
                              {
                                "type": "html",
                                "value": "boards"
                              },
                              {
                                "type": "html",
                                "value": "boards"
                              }
                            ]
                          },
                          "function": {
                            "type": "withActualResult",
                            "getActualResult": {
                              "signature": {
                                "parameters": [
                                  {
                                    "parameterId": "parameterId",
                                    "name": "name",
                                    "variableType": {
                                      "type": "integerType"
                                    }
                                  },
                                  {
                                    "parameterId": "parameterId",
                                    "name": "name",
                                    "variableType": {
                                      "type": "integerType"
                                    }
                                  }
                                ],
                                "returnType": {
                                  "type": "integerType"
                                }
                              },
                              "code": {
                                "codeByLanguage": {
                                  "JAVA": {
                                    "impl": "impl"
                                  }
                                }
                              }
                            },
                            "assertCorrectnessCheck": {
                              "type": "deepEquality",
                              "expectedValueParameterId": "expectedValueParameterId"
                            }
                          }
                        }
                      },
                      {
                        "templateId": "templateId",
                        "name": "name",
                        "implementation": {
                          "description": {
                            "boards": [
                              {
                                "type": "html",
                                "value": "boards"
                              },
                              {
                                "type": "html",
                                "value": "boards"
                              }
                            ]
                          },
                          "function": {
                            "type": "withActualResult",
                            "getActualResult": {
                              "signature": {
                                "parameters": [
                                  {
                                    "parameterId": "parameterId",
                                    "name": "name",
                                    "variableType": {
                                      "type": "integerType"
                                    }
                                  },
                                  {
                                    "parameterId": "parameterId",
                                    "name": "name",
                                    "variableType": {
                                      "type": "integerType"
                                    }
                                  }
                                ],
                                "returnType": {
                                  "type": "integerType"
                                }
                              },
                              "code": {
                                "codeByLanguage": {
                                  "JAVA": {
                                    "impl": "impl"
                                  }
                                }
                              }
                            },
                            "assertCorrectnessCheck": {
                              "type": "deepEquality",
                              "expectedValueParameterId": "expectedValueParameterId"
                            }
                          }
                        }
                      }
                    ],
                    "testcases": [
                      {
                        "metadata": {
                          "id": "id",
                          "name": "name",
                          "hidden": true
                        },
                        "implementation": {
                          "type": "templateId",
                          "value": "implementation"
                        },
                        "arguments": {
                          "arguments": {
                            "type": "integerValue",
                            "value": 1
                          }
                        },
                        "expects": {
                          "expectedStdout": "expectedStdout"
                        }
                      },
                      {
                        "metadata": {
                          "id": "id",
                          "name": "name",
                          "hidden": true
                        },
                        "implementation": {
                          "type": "templateId",
                          "value": "implementation"
                        },
                        "arguments": {
                          "arguments": {
                            "type": "integerValue",
                            "value": 1
                          }
                        },
                        "expects": {
                          "expectedStdout": "expectedStdout"
                        }
                      }
                    ],
                    "isPublic": true
                  },
                  {
                    "problemId": "problemId",
                    "problemDescription": {
                      "boards": [
                        {
                          "type": "html",
                          "value": "boards"
                        },
                        {
                          "type": "html",
                          "value": "boards"
                        }
                      ]
                    },
                    "problemName": "problemName",
                    "problemVersion": 1,
                    "supportedLanguages": [
                      "JAVA"
                    ],
                    "customFiles": {
                      "type": "basic",
                      "methodName": "methodName",
                      "signature": {
                        "parameters": [
                          {
                            "parameterId": "parameterId",
                            "name": "name",
                            "variableType": {
                              "type": "integerType"
                            }
                          },
                          {
                            "parameterId": "parameterId",
                            "name": "name",
                            "variableType": {
                              "type": "integerType"
                            }
                          }
                        ],
                        "returnType": {
                          "type": "integerType"
                        }
                      },
                      "additionalFiles": {
                        "JAVA": {
                          "files": [
                            {
                              "filename": "filename",
                              "directory": "directory",
                              "contents": "contents",
                              "editable": true
                            },
                            {
                              "filename": "filename",
                              "directory": "directory",
                              "contents": "contents",
                              "editable": true
                            }
                          ]
                        }
                      },
                      "basicTestCaseTemplate": {
                        "templateId": "templateId",
                        "name": "name",
                        "description": {
                          "boards": [
                            {
                              "type": "html",
                              "value": "boards"
                            },
                            {
                              "type": "html",
                              "value": "boards"
                            }
                          ]
                        },
                        "expectedValueParameterId": "expectedValueParameterId"
                      }
                    },
                    "generatedFiles": {
                      "generatedTestCaseFiles": {
                        "JAVA": {
                          "files": [
                            {
                              "filename": "filename",
                              "directory": "directory",
                              "contents": "contents",
                              "editable": true
                            },
                            {
                              "filename": "filename",
                              "directory": "directory",
                              "contents": "contents",
                              "editable": true
                            }
                          ]
                        }
                      },
                      "generatedTemplateFiles": {
                        "JAVA": {
                          "files": [
                            {
                              "filename": "filename",
                              "directory": "directory",
                              "contents": "contents",
                              "editable": true
                            },
                            {
                              "filename": "filename",
                              "directory": "directory",
                              "contents": "contents",
                              "editable": true
                            }
                          ]
                        }
                      },
                      "other": {
                        "JAVA": {
                          "files": [
                            {
                              "filename": "filename",
                              "directory": "directory",
                              "contents": "contents",
                              "editable": true
                            },
                            {
                              "filename": "filename",
                              "directory": "directory",
                              "contents": "contents",
                              "editable": true
                            }
                          ]
                        }
                      }
                    },
                    "customTestCaseTemplates": [
                      {
                        "templateId": "templateId",
                        "name": "name",
                        "implementation": {
                          "description": {
                            "boards": [
                              {
                                "type": "html",
                                "value": "boards"
                              },
                              {
                                "type": "html",
                                "value": "boards"
                              }
                            ]
                          },
                          "function": {
                            "type": "withActualResult",
                            "getActualResult": {
                              "signature": {
                                "parameters": [
                                  {
                                    "parameterId": "parameterId",
                                    "name": "name",
                                    "variableType": {
                                      "type": "integerType"
                                    }
                                  },
                                  {
                                    "parameterId": "parameterId",
                                    "name": "name",
                                    "variableType": {
                                      "type": "integerType"
                                    }
                                  }
                                ],
                                "returnType": {
                                  "type": "integerType"
                                }
                              },
                              "code": {
                                "codeByLanguage": {
                                  "JAVA": {
                                    "impl": "impl"
                                  }
                                }
                              }
                            },
                            "assertCorrectnessCheck": {
                              "type": "deepEquality",
                              "expectedValueParameterId": "expectedValueParameterId"
                            }
                          }
                        }
                      },
                      {
                        "templateId": "templateId",
                        "name": "name",
                        "implementation": {
                          "description": {
                            "boards": [
                              {
                                "type": "html",
                                "value": "boards"
                              },
                              {
                                "type": "html",
                                "value": "boards"
                              }
                            ]
                          },
                          "function": {
                            "type": "withActualResult",
                            "getActualResult": {
                              "signature": {
                                "parameters": [
                                  {
                                    "parameterId": "parameterId",
                                    "name": "name",
                                    "variableType": {
                                      "type": "integerType"
                                    }
                                  },
                                  {
                                    "parameterId": "parameterId",
                                    "name": "name",
                                    "variableType": {
                                      "type": "integerType"
                                    }
                                  }
                                ],
                                "returnType": {
                                  "type": "integerType"
                                }
                              },
                              "code": {
                                "codeByLanguage": {
                                  "JAVA": {
                                    "impl": "impl"
                                  }
                                }
                              }
                            },
                            "assertCorrectnessCheck": {
                              "type": "deepEquality",
                              "expectedValueParameterId": "expectedValueParameterId"
                            }
                          }
                        }
                      }
                    ],
                    "testcases": [
                      {
                        "metadata": {
                          "id": "id",
                          "name": "name",
                          "hidden": true
                        },
                        "implementation": {
                          "type": "templateId",
                          "value": "implementation"
                        },
                        "arguments": {
                          "arguments": {
                            "type": "integerValue",
                            "value": 1
                          }
                        },
                        "expects": {
                          "expectedStdout": "expectedStdout"
                        }
                      },
                      {
                        "metadata": {
                          "id": "id",
                          "name": "name",
                          "hidden": true
                        },
                        "implementation": {
                          "type": "templateId",
                          "value": "implementation"
                        },
                        "arguments": {
                          "arguments": {
                            "type": "integerValue",
                            "value": 1
                          }
                        },
                        "expects": {
                          "expectedStdout": "expectedStdout"
                        }
                      }
                    ],
                    "isPublic": true
                  }
                ]
                """.utf8
            )
        )
        let client = TraceClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            ProblemInfoV2(
                problemId: "problemId",
                problemDescription: ProblemDescription(
                    boards: [
                        "boards",
                        "boards"
                    ]
                ),
                problemName: "problemName",
                problemVersion: 1,
                supportedLanguages: [],
                customFiles: .basic(
                    .init(
                        methodName: "methodName",
                        signature: NonVoidFunctionSignature(
                            parameters: [
                                Parameter(
                                    parameterId: "parameterId",
                                    name: "name",
                                    variableType: .integerType(.init())
                                ),
                                Parameter(
                                    parameterId: "parameterId",
                                    name: "name",
                                    variableType: .integerType(.init())
                                )
                            ],
                            returnType: .integerType(.init())
                        ),
                        additionalFiles: [
                            .java: Files(
                                files: [
                                    FileInfoV2(
                                        filename: "filename",
                                        directory: "directory",
                                        contents: "contents",
                                        editable: true
                                    ),
                                    FileInfoV2(
                                        filename: "filename",
                                        directory: "directory",
                                        contents: "contents",
                                        editable: true
                                    )
                                ]
                            )
                        ],
                        basicTestCaseTemplate: BasicTestCaseTemplate(
                            templateId: "templateId",
                            name: "name",
                            description: TestCaseImplementationDescription(
                                boards: [
                                    "boards",
                                    "boards"
                                ]
                            ),
                            expectedValueParameterId: "expectedValueParameterId"
                        )
                    )
                ),
                generatedFiles: GeneratedFiles(
                    generatedTestCaseFiles: [
                        .java: Files(
                            files: [
                                FileInfoV2(
                                    filename: "filename",
                                    directory: "directory",
                                    contents: "contents",
                                    editable: true
                                ),
                                FileInfoV2(
                                    filename: "filename",
                                    directory: "directory",
                                    contents: "contents",
                                    editable: true
                                )
                            ]
                        )
                    ],
                    generatedTemplateFiles: [
                        .java: Files(
                            files: [
                                FileInfoV2(
                                    filename: "filename",
                                    directory: "directory",
                                    contents: "contents",
                                    editable: true
                                ),
                                FileInfoV2(
                                    filename: "filename",
                                    directory: "directory",
                                    contents: "contents",
                                    editable: true
                                )
                            ]
                        )
                    ],
                    other: [
                        .java: Files(
                            files: [
                                FileInfoV2(
                                    filename: "filename",
                                    directory: "directory",
                                    contents: "contents",
                                    editable: true
                                ),
                                FileInfoV2(
                                    filename: "filename",
                                    directory: "directory",
                                    contents: "contents",
                                    editable: true
                                )
                            ]
                        )
                    ]
                ),
                customTestCaseTemplates: [
                    TestCaseTemplate(
                        templateId: "templateId",
                        name: "name",
                        implementation: TestCaseImplementation(
                            description: TestCaseImplementationDescription(
                                boards: [
                                    "boards",
                                    "boards"
                                ]
                            ),
                            function: .withActualResult(
                                .init(
                                    getActualResult: NonVoidFunctionDefinition(
                                        signature: NonVoidFunctionSignature(
                                            parameters: [
                                                Parameter(
                                                    parameterId: "parameterId",
                                                    name: "name",
                                                    variableType: .integerType(.init())
                                                ),
                                                Parameter(
                                                    parameterId: "parameterId",
                                                    name: "name",
                                                    variableType: .integerType(.init())
                                                )
                                            ],
                                            returnType: .integerType(.init())
                                        ),
                                        code: FunctionImplementationForMultipleLanguages(
                                            codeByLanguage: [
                                                .java: FunctionImplementation(
                                                    impl: "impl"
                                                )
                                            ]
                                        )
                                    ),
                                    assertCorrectnessCheck: .deepEquality(
                                        .init(
                                            expectedValueParameterId: "expectedValueParameterId"
                                        )
                                    )
                                )
                            )
                        )
                    ),
                    TestCaseTemplate(
                        templateId: "templateId",
                        name: "name",
                        implementation: TestCaseImplementation(
                            description: TestCaseImplementationDescription(
                                boards: [
                                    "boards",
                                    "boards"
                                ]
                            ),
                            function: .withActualResult(
                                .init(
                                    getActualResult: NonVoidFunctionDefinition(
                                        signature: NonVoidFunctionSignature(
                                            parameters: [
                                                Parameter(
                                                    parameterId: "parameterId",
                                                    name: "name",
                                                    variableType: .integerType(.init())
                                                ),
                                                Parameter(
                                                    parameterId: "parameterId",
                                                    name: "name",
                                                    variableType: .integerType(.init())
                                                )
                                            ],
                                            returnType: .integerType(.init())
                                        ),
                                        code: FunctionImplementationForMultipleLanguages(
                                            codeByLanguage: [
                                                .java: FunctionImplementation(
                                                    impl: "impl"
                                                )
                                            ]
                                        )
                                    ),
                                    assertCorrectnessCheck: .deepEquality(
                                        .init(
                                            expectedValueParameterId: "expectedValueParameterId"
                                        )
                                    )
                                )
                            )
                        )
                    )
                ],
                testcases: [
                    TestCaseV2(
                        metadata: TestCaseMetadata(
                            id: "id",
                            name: "name",
                            hidden: true
                        ),
                        implementation: "implementation",
                        arguments: [
                            "arguments": 1
                        ],
                        expects: Optional(TestCaseExpects(
                            expectedStdout: Optional("expectedStdout")
                        ))
                    ),
                    TestCaseV2(
                        metadata: TestCaseMetadata(
                            id: "id",
                            name: "name",
                            hidden: true
                        ),
                        implementation: "implementation",
                        arguments: [
                            "arguments": 1
                        ],
                        expects: Optional(TestCaseExpects(
                            expectedStdout: Optional("expectedStdout")
                        ))
                    )
                ],
                isPublic: true
            ),
            ProblemInfoV2(
                problemId: "problemId",
                problemDescription: ProblemDescription(
                    boards: [
                        "boards",
                        "boards"
                    ]
                ),
                problemName: "problemName",
                problemVersion: 1,
                supportedLanguages: [],
                customFiles: .basic(
                    .init(
                        methodName: "methodName",
                        signature: NonVoidFunctionSignature(
                            parameters: [
                                Parameter(
                                    parameterId: "parameterId",
                                    name: "name",
                                    variableType: .integerType(.init())
                                ),
                                Parameter(
                                    parameterId: "parameterId",
                                    name: "name",
                                    variableType: .integerType(.init())
                                )
                            ],
                            returnType: .integerType(.init())
                        ),
                        additionalFiles: [
                            .java: Files(
                                files: [
                                    FileInfoV2(
                                        filename: "filename",
                                        directory: "directory",
                                        contents: "contents",
                                        editable: true
                                    ),
                                    FileInfoV2(
                                        filename: "filename",
                                        directory: "directory",
                                        contents: "contents",
                                        editable: true
                                    )
                                ]
                            )
                        ],
                        basicTestCaseTemplate: BasicTestCaseTemplate(
                            templateId: "templateId",
                            name: "name",
                            description: TestCaseImplementationDescription(
                                boards: [
                                    "boards",
                                    "boards"
                                ]
                            ),
                            expectedValueParameterId: "expectedValueParameterId"
                        )
                    )
                ),
                generatedFiles: GeneratedFiles(
                    generatedTestCaseFiles: [
                        .java: Files(
                            files: [
                                FileInfoV2(
                                    filename: "filename",
                                    directory: "directory",
                                    contents: "contents",
                                    editable: true
                                ),
                                FileInfoV2(
                                    filename: "filename",
                                    directory: "directory",
                                    contents: "contents",
                                    editable: true
                                )
                            ]
                        )
                    ],
                    generatedTemplateFiles: [
                        .java: Files(
                            files: [
                                FileInfoV2(
                                    filename: "filename",
                                    directory: "directory",
                                    contents: "contents",
                                    editable: true
                                ),
                                FileInfoV2(
                                    filename: "filename",
                                    directory: "directory",
                                    contents: "contents",
                                    editable: true
                                )
                            ]
                        )
                    ],
                    other: [
                        .java: Files(
                            files: [
                                FileInfoV2(
                                    filename: "filename",
                                    directory: "directory",
                                    contents: "contents",
                                    editable: true
                                ),
                                FileInfoV2(
                                    filename: "filename",
                                    directory: "directory",
                                    contents: "contents",
                                    editable: true
                                )
                            ]
                        )
                    ]
                ),
                customTestCaseTemplates: [
                    TestCaseTemplate(
                        templateId: "templateId",
                        name: "name",
                        implementation: TestCaseImplementation(
                            description: TestCaseImplementationDescription(
                                boards: [
                                    "boards",
                                    "boards"
                                ]
                            ),
                            function: .withActualResult(
                                .init(
                                    getActualResult: NonVoidFunctionDefinition(
                                        signature: NonVoidFunctionSignature(
                                            parameters: [
                                                Parameter(
                                                    parameterId: "parameterId",
                                                    name: "name",
                                                    variableType: .integerType(.init())
                                                ),
                                                Parameter(
                                                    parameterId: "parameterId",
                                                    name: "name",
                                                    variableType: .integerType(.init())
                                                )
                                            ],
                                            returnType: .integerType(.init())
                                        ),
                                        code: FunctionImplementationForMultipleLanguages(
                                            codeByLanguage: [
                                                .java: FunctionImplementation(
                                                    impl: "impl"
                                                )
                                            ]
                                        )
                                    ),
                                    assertCorrectnessCheck: .deepEquality(
                                        .init(
                                            expectedValueParameterId: "expectedValueParameterId"
                                        )
                                    )
                                )
                            )
                        )
                    ),
                    TestCaseTemplate(
                        templateId: "templateId",
                        name: "name",
                        implementation: TestCaseImplementation(
                            description: TestCaseImplementationDescription(
                                boards: [
                                    "boards",
                                    "boards"
                                ]
                            ),
                            function: .withActualResult(
                                .init(
                                    getActualResult: NonVoidFunctionDefinition(
                                        signature: NonVoidFunctionSignature(
                                            parameters: [
                                                Parameter(
                                                    parameterId: "parameterId",
                                                    name: "name",
                                                    variableType: .integerType(.init())
                                                ),
                                                Parameter(
                                                    parameterId: "parameterId",
                                                    name: "name",
                                                    variableType: .integerType(.init())
                                                )
                                            ],
                                            returnType: .integerType(.init())
                                        ),
                                        code: FunctionImplementationForMultipleLanguages(
                                            codeByLanguage: [
                                                .java: FunctionImplementation(
                                                    impl: "impl"
                                                )
                                            ]
                                        )
                                    ),
                                    assertCorrectnessCheck: .deepEquality(
                                        .init(
                                            expectedValueParameterId: "expectedValueParameterId"
                                        )
                                    )
                                )
                            )
                        )
                    )
                ],
                testcases: [
                    TestCaseV2(
                        metadata: TestCaseMetadata(
                            id: "id",
                            name: "name",
                            hidden: true
                        ),
                        implementation: "implementation",
                        arguments: [
                            "arguments": 1
                        ],
                        expects: Optional(TestCaseExpects(
                            expectedStdout: Optional("expectedStdout")
                        ))
                    ),
                    TestCaseV2(
                        metadata: TestCaseMetadata(
                            id: "id",
                            name: "name",
                            hidden: true
                        ),
                        implementation: "implementation",
                        arguments: [
                            "arguments": 1
                        ],
                        expects: Optional(TestCaseExpects(
                            expectedStdout: Optional("expectedStdout")
                        ))
                    )
                ],
                isPublic: true
            )
        ]
        let response = try await client.v2.problem.getProblems(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func getLatestProblem1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "problemId": "problemId",
                  "problemDescription": {
                    "boards": [
                      {
                        "type": "html",
                        "value": "boards"
                      },
                      {
                        "type": "html",
                        "value": "boards"
                      }
                    ]
                  },
                  "problemName": "problemName",
                  "problemVersion": 1,
                  "supportedLanguages": [
                    "JAVA"
                  ],
                  "customFiles": {
                    "type": "basic",
                    "methodName": "methodName",
                    "signature": {
                      "parameters": [
                        {
                          "parameterId": "parameterId",
                          "name": "name",
                          "variableType": {
                            "type": "integerType"
                          }
                        },
                        {
                          "parameterId": "parameterId",
                          "name": "name",
                          "variableType": {
                            "type": "integerType"
                          }
                        }
                      ],
                      "returnType": {
                        "type": "integerType"
                      }
                    },
                    "additionalFiles": {
                      "JAVA": {
                        "files": [
                          {
                            "filename": "filename",
                            "directory": "directory",
                            "contents": "contents",
                            "editable": true
                          },
                          {
                            "filename": "filename",
                            "directory": "directory",
                            "contents": "contents",
                            "editable": true
                          }
                        ]
                      }
                    },
                    "basicTestCaseTemplate": {
                      "templateId": "templateId",
                      "name": "name",
                      "description": {
                        "boards": [
                          {
                            "type": "html",
                            "value": "boards"
                          },
                          {
                            "type": "html",
                            "value": "boards"
                          }
                        ]
                      },
                      "expectedValueParameterId": "expectedValueParameterId"
                    }
                  },
                  "generatedFiles": {
                    "generatedTestCaseFiles": {
                      "JAVA": {
                        "files": [
                          {
                            "filename": "filename",
                            "directory": "directory",
                            "contents": "contents",
                            "editable": true
                          },
                          {
                            "filename": "filename",
                            "directory": "directory",
                            "contents": "contents",
                            "editable": true
                          }
                        ]
                      }
                    },
                    "generatedTemplateFiles": {
                      "JAVA": {
                        "files": [
                          {
                            "filename": "filename",
                            "directory": "directory",
                            "contents": "contents",
                            "editable": true
                          },
                          {
                            "filename": "filename",
                            "directory": "directory",
                            "contents": "contents",
                            "editable": true
                          }
                        ]
                      }
                    },
                    "other": {
                      "JAVA": {
                        "files": [
                          {
                            "filename": "filename",
                            "directory": "directory",
                            "contents": "contents",
                            "editable": true
                          },
                          {
                            "filename": "filename",
                            "directory": "directory",
                            "contents": "contents",
                            "editable": true
                          }
                        ]
                      }
                    }
                  },
                  "customTestCaseTemplates": [
                    {
                      "templateId": "templateId",
                      "name": "name",
                      "implementation": {
                        "description": {
                          "boards": [
                            {
                              "type": "html",
                              "value": "boards"
                            },
                            {
                              "type": "html",
                              "value": "boards"
                            }
                          ]
                        },
                        "function": {
                          "type": "withActualResult",
                          "getActualResult": {
                            "signature": {
                              "parameters": [
                                {
                                  "parameterId": "parameterId",
                                  "name": "name",
                                  "variableType": {
                                    "type": "integerType"
                                  }
                                },
                                {
                                  "parameterId": "parameterId",
                                  "name": "name",
                                  "variableType": {
                                    "type": "integerType"
                                  }
                                }
                              ],
                              "returnType": {
                                "type": "integerType"
                              }
                            },
                            "code": {
                              "codeByLanguage": {
                                "JAVA": {
                                  "impl": "impl",
                                  "imports": "imports"
                                }
                              }
                            }
                          },
                          "assertCorrectnessCheck": {
                            "type": "deepEquality",
                            "expectedValueParameterId": "expectedValueParameterId"
                          }
                        }
                      }
                    },
                    {
                      "templateId": "templateId",
                      "name": "name",
                      "implementation": {
                        "description": {
                          "boards": [
                            {
                              "type": "html",
                              "value": "boards"
                            },
                            {
                              "type": "html",
                              "value": "boards"
                            }
                          ]
                        },
                        "function": {
                          "type": "withActualResult",
                          "getActualResult": {
                            "signature": {
                              "parameters": [
                                {
                                  "parameterId": "parameterId",
                                  "name": "name",
                                  "variableType": {
                                    "type": "integerType"
                                  }
                                },
                                {
                                  "parameterId": "parameterId",
                                  "name": "name",
                                  "variableType": {
                                    "type": "integerType"
                                  }
                                }
                              ],
                              "returnType": {
                                "type": "integerType"
                              }
                            },
                            "code": {
                              "codeByLanguage": {
                                "JAVA": {
                                  "impl": "impl",
                                  "imports": "imports"
                                }
                              }
                            }
                          },
                          "assertCorrectnessCheck": {
                            "type": "deepEquality",
                            "expectedValueParameterId": "expectedValueParameterId"
                          }
                        }
                      }
                    }
                  ],
                  "testcases": [
                    {
                      "metadata": {
                        "id": "id",
                        "name": "name",
                        "hidden": true
                      },
                      "implementation": {
                        "type": "templateId",
                        "value": "implementation"
                      },
                      "arguments": {
                        "arguments": {
                          "type": "integerValue",
                          "value": 1
                        }
                      },
                      "expects": {
                        "expectedStdout": "expectedStdout"
                      }
                    },
                    {
                      "metadata": {
                        "id": "id",
                        "name": "name",
                        "hidden": true
                      },
                      "implementation": {
                        "type": "templateId",
                        "value": "implementation"
                      },
                      "arguments": {
                        "arguments": {
                          "type": "integerValue",
                          "value": 1
                        }
                      },
                      "expects": {
                        "expectedStdout": "expectedStdout"
                      }
                    }
                  ],
                  "isPublic": true
                }
                """.utf8
            )
        )
        let client = TraceClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = ProblemInfoV2(
            problemId: "problemId",
            problemDescription: ProblemDescription(
                boards: [
                    "boards",
                    "boards"
                ]
            ),
            problemName: "problemName",
            problemVersion: 1,
            supportedLanguages: [],
            customFiles: .basic(
                .init(
                    methodName: "methodName",
                    signature: NonVoidFunctionSignature(
                        parameters: [
                            Parameter(
                                parameterId: "parameterId",
                                name: "name",
                                variableType: .integerType(.init())
                            ),
                            Parameter(
                                parameterId: "parameterId",
                                name: "name",
                                variableType: .integerType(.init())
                            )
                        ],
                        returnType: .integerType(.init())
                    ),
                    additionalFiles: [
                        .java: Files(
                            files: [
                                FileInfoV2(
                                    filename: "filename",
                                    directory: "directory",
                                    contents: "contents",
                                    editable: true
                                ),
                                FileInfoV2(
                                    filename: "filename",
                                    directory: "directory",
                                    contents: "contents",
                                    editable: true
                                )
                            ]
                        )
                    ],
                    basicTestCaseTemplate: BasicTestCaseTemplate(
                        templateId: "templateId",
                        name: "name",
                        description: TestCaseImplementationDescription(
                            boards: [
                                "boards",
                                "boards"
                            ]
                        ),
                        expectedValueParameterId: "expectedValueParameterId"
                    )
                )
            ),
            generatedFiles: GeneratedFiles(
                generatedTestCaseFiles: [
                    .java: Files(
                        files: [
                            FileInfoV2(
                                filename: "filename",
                                directory: "directory",
                                contents: "contents",
                                editable: true
                            ),
                            FileInfoV2(
                                filename: "filename",
                                directory: "directory",
                                contents: "contents",
                                editable: true
                            )
                        ]
                    )
                ],
                generatedTemplateFiles: [
                    .java: Files(
                        files: [
                            FileInfoV2(
                                filename: "filename",
                                directory: "directory",
                                contents: "contents",
                                editable: true
                            ),
                            FileInfoV2(
                                filename: "filename",
                                directory: "directory",
                                contents: "contents",
                                editable: true
                            )
                        ]
                    )
                ],
                other: [
                    .java: Files(
                        files: [
                            FileInfoV2(
                                filename: "filename",
                                directory: "directory",
                                contents: "contents",
                                editable: true
                            ),
                            FileInfoV2(
                                filename: "filename",
                                directory: "directory",
                                contents: "contents",
                                editable: true
                            )
                        ]
                    )
                ]
            ),
            customTestCaseTemplates: [
                TestCaseTemplate(
                    templateId: "templateId",
                    name: "name",
                    implementation: TestCaseImplementation(
                        description: TestCaseImplementationDescription(
                            boards: [
                                "boards",
                                "boards"
                            ]
                        ),
                        function: .withActualResult(
                            .init(
                                getActualResult: NonVoidFunctionDefinition(
                                    signature: NonVoidFunctionSignature(
                                        parameters: [
                                            Parameter(
                                                parameterId: "parameterId",
                                                name: "name",
                                                variableType: .integerType(.init())
                                            ),
                                            Parameter(
                                                parameterId: "parameterId",
                                                name: "name",
                                                variableType: .integerType(.init())
                                            )
                                        ],
                                        returnType: .integerType(.init())
                                    ),
                                    code: FunctionImplementationForMultipleLanguages(
                                        codeByLanguage: [
                                            .java: FunctionImplementation(
                                                impl: "impl",
                                                imports: Optional("imports")
                                            )
                                        ]
                                    )
                                ),
                                assertCorrectnessCheck: .deepEquality(
                                    .init(
                                        expectedValueParameterId: "expectedValueParameterId"
                                    )
                                )
                            )
                        )
                    )
                ),
                TestCaseTemplate(
                    templateId: "templateId",
                    name: "name",
                    implementation: TestCaseImplementation(
                        description: TestCaseImplementationDescription(
                            boards: [
                                "boards",
                                "boards"
                            ]
                        ),
                        function: .withActualResult(
                            .init(
                                getActualResult: NonVoidFunctionDefinition(
                                    signature: NonVoidFunctionSignature(
                                        parameters: [
                                            Parameter(
                                                parameterId: "parameterId",
                                                name: "name",
                                                variableType: .integerType(.init())
                                            ),
                                            Parameter(
                                                parameterId: "parameterId",
                                                name: "name",
                                                variableType: .integerType(.init())
                                            )
                                        ],
                                        returnType: .integerType(.init())
                                    ),
                                    code: FunctionImplementationForMultipleLanguages(
                                        codeByLanguage: [
                                            .java: FunctionImplementation(
                                                impl: "impl",
                                                imports: Optional("imports")
                                            )
                                        ]
                                    )
                                ),
                                assertCorrectnessCheck: .deepEquality(
                                    .init(
                                        expectedValueParameterId: "expectedValueParameterId"
                                    )
                                )
                            )
                        )
                    )
                )
            ],
            testcases: [
                TestCaseV2(
                    metadata: TestCaseMetadata(
                        id: "id",
                        name: "name",
                        hidden: true
                    ),
                    implementation: "implementation",
                    arguments: [
                        "arguments": 1
                    ],
                    expects: Optional(TestCaseExpects(
                        expectedStdout: Optional("expectedStdout")
                    ))
                ),
                TestCaseV2(
                    metadata: TestCaseMetadata(
                        id: "id",
                        name: "name",
                        hidden: true
                    ),
                    implementation: "implementation",
                    arguments: [
                        "arguments": 1
                    ],
                    expects: Optional(TestCaseExpects(
                        expectedStdout: Optional("expectedStdout")
                    ))
                )
            ],
            isPublic: true
        )
        let response = try await client.v2.problem.getLatestProblem(
            problemId: "problemId",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getProblemVersion1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "problemId": "problemId",
                  "problemDescription": {
                    "boards": [
                      {
                        "type": "html",
                        "value": "boards"
                      },
                      {
                        "type": "html",
                        "value": "boards"
                      }
                    ]
                  },
                  "problemName": "problemName",
                  "problemVersion": 1,
                  "supportedLanguages": [
                    "JAVA"
                  ],
                  "customFiles": {
                    "type": "basic",
                    "methodName": "methodName",
                    "signature": {
                      "parameters": [
                        {
                          "parameterId": "parameterId",
                          "name": "name",
                          "variableType": {
                            "type": "integerType"
                          }
                        },
                        {
                          "parameterId": "parameterId",
                          "name": "name",
                          "variableType": {
                            "type": "integerType"
                          }
                        }
                      ],
                      "returnType": {
                        "type": "integerType"
                      }
                    },
                    "additionalFiles": {
                      "JAVA": {
                        "files": [
                          {
                            "filename": "filename",
                            "directory": "directory",
                            "contents": "contents",
                            "editable": true
                          },
                          {
                            "filename": "filename",
                            "directory": "directory",
                            "contents": "contents",
                            "editable": true
                          }
                        ]
                      }
                    },
                    "basicTestCaseTemplate": {
                      "templateId": "templateId",
                      "name": "name",
                      "description": {
                        "boards": [
                          {
                            "type": "html",
                            "value": "boards"
                          },
                          {
                            "type": "html",
                            "value": "boards"
                          }
                        ]
                      },
                      "expectedValueParameterId": "expectedValueParameterId"
                    }
                  },
                  "generatedFiles": {
                    "generatedTestCaseFiles": {
                      "JAVA": {
                        "files": [
                          {
                            "filename": "filename",
                            "directory": "directory",
                            "contents": "contents",
                            "editable": true
                          },
                          {
                            "filename": "filename",
                            "directory": "directory",
                            "contents": "contents",
                            "editable": true
                          }
                        ]
                      }
                    },
                    "generatedTemplateFiles": {
                      "JAVA": {
                        "files": [
                          {
                            "filename": "filename",
                            "directory": "directory",
                            "contents": "contents",
                            "editable": true
                          },
                          {
                            "filename": "filename",
                            "directory": "directory",
                            "contents": "contents",
                            "editable": true
                          }
                        ]
                      }
                    },
                    "other": {
                      "JAVA": {
                        "files": [
                          {
                            "filename": "filename",
                            "directory": "directory",
                            "contents": "contents",
                            "editable": true
                          },
                          {
                            "filename": "filename",
                            "directory": "directory",
                            "contents": "contents",
                            "editable": true
                          }
                        ]
                      }
                    }
                  },
                  "customTestCaseTemplates": [
                    {
                      "templateId": "templateId",
                      "name": "name",
                      "implementation": {
                        "description": {
                          "boards": [
                            {
                              "type": "html",
                              "value": "boards"
                            },
                            {
                              "type": "html",
                              "value": "boards"
                            }
                          ]
                        },
                        "function": {
                          "type": "withActualResult",
                          "getActualResult": {
                            "signature": {
                              "parameters": [
                                {
                                  "parameterId": "parameterId",
                                  "name": "name",
                                  "variableType": {
                                    "type": "integerType"
                                  }
                                },
                                {
                                  "parameterId": "parameterId",
                                  "name": "name",
                                  "variableType": {
                                    "type": "integerType"
                                  }
                                }
                              ],
                              "returnType": {
                                "type": "integerType"
                              }
                            },
                            "code": {
                              "codeByLanguage": {
                                "JAVA": {
                                  "impl": "impl",
                                  "imports": "imports"
                                }
                              }
                            }
                          },
                          "assertCorrectnessCheck": {
                            "type": "deepEquality",
                            "expectedValueParameterId": "expectedValueParameterId"
                          }
                        }
                      }
                    },
                    {
                      "templateId": "templateId",
                      "name": "name",
                      "implementation": {
                        "description": {
                          "boards": [
                            {
                              "type": "html",
                              "value": "boards"
                            },
                            {
                              "type": "html",
                              "value": "boards"
                            }
                          ]
                        },
                        "function": {
                          "type": "withActualResult",
                          "getActualResult": {
                            "signature": {
                              "parameters": [
                                {
                                  "parameterId": "parameterId",
                                  "name": "name",
                                  "variableType": {
                                    "type": "integerType"
                                  }
                                },
                                {
                                  "parameterId": "parameterId",
                                  "name": "name",
                                  "variableType": {
                                    "type": "integerType"
                                  }
                                }
                              ],
                              "returnType": {
                                "type": "integerType"
                              }
                            },
                            "code": {
                              "codeByLanguage": {
                                "JAVA": {
                                  "impl": "impl",
                                  "imports": "imports"
                                }
                              }
                            }
                          },
                          "assertCorrectnessCheck": {
                            "type": "deepEquality",
                            "expectedValueParameterId": "expectedValueParameterId"
                          }
                        }
                      }
                    }
                  ],
                  "testcases": [
                    {
                      "metadata": {
                        "id": "id",
                        "name": "name",
                        "hidden": true
                      },
                      "implementation": {
                        "type": "templateId",
                        "value": "implementation"
                      },
                      "arguments": {
                        "arguments": {
                          "type": "integerValue",
                          "value": 1
                        }
                      },
                      "expects": {
                        "expectedStdout": "expectedStdout"
                      }
                    },
                    {
                      "metadata": {
                        "id": "id",
                        "name": "name",
                        "hidden": true
                      },
                      "implementation": {
                        "type": "templateId",
                        "value": "implementation"
                      },
                      "arguments": {
                        "arguments": {
                          "type": "integerValue",
                          "value": 1
                        }
                      },
                      "expects": {
                        "expectedStdout": "expectedStdout"
                      }
                    }
                  ],
                  "isPublic": true
                }
                """.utf8
            )
        )
        let client = TraceClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = ProblemInfoV2(
            problemId: "problemId",
            problemDescription: ProblemDescription(
                boards: [
                    "boards",
                    "boards"
                ]
            ),
            problemName: "problemName",
            problemVersion: 1,
            supportedLanguages: [],
            customFiles: .basic(
                .init(
                    methodName: "methodName",
                    signature: NonVoidFunctionSignature(
                        parameters: [
                            Parameter(
                                parameterId: "parameterId",
                                name: "name",
                                variableType: .integerType(.init())
                            ),
                            Parameter(
                                parameterId: "parameterId",
                                name: "name",
                                variableType: .integerType(.init())
                            )
                        ],
                        returnType: .integerType(.init())
                    ),
                    additionalFiles: [
                        .java: Files(
                            files: [
                                FileInfoV2(
                                    filename: "filename",
                                    directory: "directory",
                                    contents: "contents",
                                    editable: true
                                ),
                                FileInfoV2(
                                    filename: "filename",
                                    directory: "directory",
                                    contents: "contents",
                                    editable: true
                                )
                            ]
                        )
                    ],
                    basicTestCaseTemplate: BasicTestCaseTemplate(
                        templateId: "templateId",
                        name: "name",
                        description: TestCaseImplementationDescription(
                            boards: [
                                "boards",
                                "boards"
                            ]
                        ),
                        expectedValueParameterId: "expectedValueParameterId"
                    )
                )
            ),
            generatedFiles: GeneratedFiles(
                generatedTestCaseFiles: [
                    .java: Files(
                        files: [
                            FileInfoV2(
                                filename: "filename",
                                directory: "directory",
                                contents: "contents",
                                editable: true
                            ),
                            FileInfoV2(
                                filename: "filename",
                                directory: "directory",
                                contents: "contents",
                                editable: true
                            )
                        ]
                    )
                ],
                generatedTemplateFiles: [
                    .java: Files(
                        files: [
                            FileInfoV2(
                                filename: "filename",
                                directory: "directory",
                                contents: "contents",
                                editable: true
                            ),
                            FileInfoV2(
                                filename: "filename",
                                directory: "directory",
                                contents: "contents",
                                editable: true
                            )
                        ]
                    )
                ],
                other: [
                    .java: Files(
                        files: [
                            FileInfoV2(
                                filename: "filename",
                                directory: "directory",
                                contents: "contents",
                                editable: true
                            ),
                            FileInfoV2(
                                filename: "filename",
                                directory: "directory",
                                contents: "contents",
                                editable: true
                            )
                        ]
                    )
                ]
            ),
            customTestCaseTemplates: [
                TestCaseTemplate(
                    templateId: "templateId",
                    name: "name",
                    implementation: TestCaseImplementation(
                        description: TestCaseImplementationDescription(
                            boards: [
                                "boards",
                                "boards"
                            ]
                        ),
                        function: .withActualResult(
                            .init(
                                getActualResult: NonVoidFunctionDefinition(
                                    signature: NonVoidFunctionSignature(
                                        parameters: [
                                            Parameter(
                                                parameterId: "parameterId",
                                                name: "name",
                                                variableType: .integerType(.init())
                                            ),
                                            Parameter(
                                                parameterId: "parameterId",
                                                name: "name",
                                                variableType: .integerType(.init())
                                            )
                                        ],
                                        returnType: .integerType(.init())
                                    ),
                                    code: FunctionImplementationForMultipleLanguages(
                                        codeByLanguage: [
                                            .java: FunctionImplementation(
                                                impl: "impl",
                                                imports: Optional("imports")
                                            )
                                        ]
                                    )
                                ),
                                assertCorrectnessCheck: .deepEquality(
                                    .init(
                                        expectedValueParameterId: "expectedValueParameterId"
                                    )
                                )
                            )
                        )
                    )
                ),
                TestCaseTemplate(
                    templateId: "templateId",
                    name: "name",
                    implementation: TestCaseImplementation(
                        description: TestCaseImplementationDescription(
                            boards: [
                                "boards",
                                "boards"
                            ]
                        ),
                        function: .withActualResult(
                            .init(
                                getActualResult: NonVoidFunctionDefinition(
                                    signature: NonVoidFunctionSignature(
                                        parameters: [
                                            Parameter(
                                                parameterId: "parameterId",
                                                name: "name",
                                                variableType: .integerType(.init())
                                            ),
                                            Parameter(
                                                parameterId: "parameterId",
                                                name: "name",
                                                variableType: .integerType(.init())
                                            )
                                        ],
                                        returnType: .integerType(.init())
                                    ),
                                    code: FunctionImplementationForMultipleLanguages(
                                        codeByLanguage: [
                                            .java: FunctionImplementation(
                                                impl: "impl",
                                                imports: Optional("imports")
                                            )
                                        ]
                                    )
                                ),
                                assertCorrectnessCheck: .deepEquality(
                                    .init(
                                        expectedValueParameterId: "expectedValueParameterId"
                                    )
                                )
                            )
                        )
                    )
                )
            ],
            testcases: [
                TestCaseV2(
                    metadata: TestCaseMetadata(
                        id: "id",
                        name: "name",
                        hidden: true
                    ),
                    implementation: "implementation",
                    arguments: [
                        "arguments": 1
                    ],
                    expects: Optional(TestCaseExpects(
                        expectedStdout: Optional("expectedStdout")
                    ))
                ),
                TestCaseV2(
                    metadata: TestCaseMetadata(
                        id: "id",
                        name: "name",
                        hidden: true
                    ),
                    implementation: "implementation",
                    arguments: [
                        "arguments": 1
                    ],
                    expects: Optional(TestCaseExpects(
                        expectedStdout: Optional("expectedStdout")
                    ))
                )
            ],
            isPublic: true
        )
        let response = try await client.v2.problem.getProblemVersion(
            problemId: "problemId",
            problemVersion: 1,
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}