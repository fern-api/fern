import Foundation
import Testing
import Api

@Suite("V2V3ProblemClient Wire Tests") struct V2V3ProblemClientWireTests {
    @Test func v2V3ProblemGetLightweightProblems1() async throws -> Void {
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
                  }
                ]
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            V2V3LightweightProblemInfoV2(
                problemId: "problemId",
                problemName: "problemName",
                problemVersion: 1,
                variableTypes: [
                    VariableType.variableTypeZero(
                        VariableTypeZero(
                            type: .integerType
                        )
                    )
                ]
            )
        ]
        let response = try await client.v2V3Problem.v2V3ProblemGetLightweightProblems(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func v2V3ProblemGetLightweightProblems2() async throws -> Void {
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
                      },
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
                      },
                      {
                        "type": "integerType"
                      }
                    ]
                  }
                ]
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            V2V3LightweightProblemInfoV2(
                problemId: "problemId",
                problemName: "problemName",
                problemVersion: 1,
                variableTypes: [
                    VariableType.variableTypeZero(
                        VariableTypeZero(
                            type: .integerType
                        )
                    ),
                    VariableType.variableTypeZero(
                        VariableTypeZero(
                            type: .integerType
                        )
                    )
                ]
            ),
            V2V3LightweightProblemInfoV2(
                problemId: "problemId",
                problemName: "problemName",
                problemVersion: 1,
                variableTypes: [
                    VariableType.variableTypeZero(
                        VariableTypeZero(
                            type: .integerType
                        )
                    ),
                    VariableType.variableTypeZero(
                        VariableTypeZero(
                            type: .integerType
                        )
                    )
                ]
            )
        ]
        let response = try await client.v2V3Problem.v2V3ProblemGetLightweightProblems(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func v2V3ProblemGetProblems1() async throws -> Void {
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
                          "type": "html"
                        }
                      ]
                    },
                    "problemName": "problemName",
                    "problemVersion": 1,
                    "supportedLanguages": [
                      "JAVA"
                    ],
                    "customFiles": {
                      "methodName": "methodName",
                      "signature": {
                        "parameters": [
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
                        "key": {
                          "files": [
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
                              "type": "html"
                            }
                          ]
                        },
                        "expectedValueParameterId": "expectedValueParameterId"
                      },
                      "type": "basic"
                    },
                    "generatedFiles": {
                      "generatedTestCaseFiles": {
                        "key": {
                          "files": [
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
                        "key": {
                          "files": [
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
                        "key": {
                          "files": [
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
                                "type": "html"
                              }
                            ]
                          },
                          "function": {
                            "getActualResult": {
                              "signature": {
                                "parameters": [
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
                                  "key": {
                                    "impl": "impl"
                                  }
                                }
                              }
                            },
                            "assertCorrectnessCheck": {
                              "expectedValueParameterId": "expectedValueParameterId",
                              "type": "deepEquality"
                            },
                            "type": "withActualResult"
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
                          "type": "templateId"
                        },
                        "arguments": {
                          "key": {
                            "type": "integerValue"
                          }
                        }
                      }
                    ],
                    "isPublic": true
                  }
                ]
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            V2V3ProblemInfoV2(
                problemId: "problemId",
                problemDescription: ProblemDescription(
                    boards: [
                        ProblemDescriptionBoard.html(
                            .init(
                                additionalProperties: [
                                    "type": JSONValue.string("html")
                                ]
                            )
                        )
                    ]
                ),
                problemName: "problemName",
                problemVersion: 1,
                supportedLanguages: [
                    .java
                ],
                customFiles: V2V3CustomFiles.v2V3CustomFilesZero(
                    V2V3CustomFilesZero(
                        methodName: "methodName",
                        signature: V2V3NonVoidFunctionSignature(
                            parameters: [
                                V2V3Parameter(
                                    parameterId: "parameterId",
                                    name: "name",
                                    variableType: VariableType.variableTypeZero(
                                        VariableTypeZero(
                                            type: .integerType
                                        )
                                    )
                                )
                            ],
                            returnType: VariableType.variableTypeZero(
                                VariableTypeZero(
                                    type: .integerType
                                )
                            )
                        ),
                        additionalFiles: [
                            "key": V2V3Files(
                                files: [
                                    V2V3FileInfoV2(
                                        filename: "filename",
                                        directory: "directory",
                                        contents: "contents",
                                        editable: true
                                    )
                                ]
                            )
                        ],
                        basicTestCaseTemplate: V2V3BasicTestCaseTemplate(
                            templateId: "templateId",
                            name: "name",
                            description: V2V3TestCaseImplementationDescription(
                                boards: [
                                    V2V3TestCaseImplementationDescriptionBoard.html(
                                        .init(
                                            additionalProperties: [
                                                "type": JSONValue.string("html")
                                            ]
                                        )
                                    )
                                ]
                            ),
                            expectedValueParameterId: "expectedValueParameterId"
                        ),
                        type: .basic
                    )
                ),
                generatedFiles: V2V3GeneratedFiles(
                    generatedTestCaseFiles: [
                        "key": V2V3Files(
                            files: [
                                V2V3FileInfoV2(
                                    filename: "filename",
                                    directory: "directory",
                                    contents: "contents",
                                    editable: true
                                )
                            ]
                        )
                    ],
                    generatedTemplateFiles: [
                        "key": V2V3Files(
                            files: [
                                V2V3FileInfoV2(
                                    filename: "filename",
                                    directory: "directory",
                                    contents: "contents",
                                    editable: true
                                )
                            ]
                        )
                    ],
                    other: [
                        "key": V2V3Files(
                            files: [
                                V2V3FileInfoV2(
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
                    V2V3TestCaseTemplate(
                        templateId: "templateId",
                        name: "name",
                        implementation: V2V3TestCaseImplementation(
                            description: V2V3TestCaseImplementationDescription(
                                boards: [
                                    V2V3TestCaseImplementationDescriptionBoard.html(
                                        .init(
                                            additionalProperties: [
                                                "type": JSONValue.string("html")
                                            ]
                                        )
                                    )
                                ]
                            ),
                            function: V2V3TestCaseFunction.v2V3TestCaseFunctionZero(
                                V2V3TestCaseFunctionZero(
                                    getActualResult: V2V3NonVoidFunctionDefinition(
                                        signature: V2V3NonVoidFunctionSignature(
                                            parameters: [
                                                V2V3Parameter(
                                                    parameterId: "parameterId",
                                                    name: "name",
                                                    variableType: VariableType.variableTypeZero(
                                                        VariableTypeZero(
                                                            type: .integerType
                                                        )
                                                    )
                                                )
                                            ],
                                            returnType: VariableType.variableTypeZero(
                                                VariableTypeZero(
                                                    type: .integerType
                                                )
                                            )
                                        ),
                                        code: V2V3FunctionImplementationForMultipleLanguages(
                                            codeByLanguage: [
                                                "key": V2V3FunctionImplementation(
                                                    impl: "impl"
                                                )
                                            ]
                                        )
                                    ),
                                    assertCorrectnessCheck: V2V3AssertCorrectnessCheck.v2V3AssertCorrectnessCheckZero(
                                        V2V3AssertCorrectnessCheckZero(
                                            expectedValueParameterId: "expectedValueParameterId",
                                            type: .deepEquality
                                        )
                                    ),
                                    type: .withActualResult
                                )
                            )
                        )
                    )
                ],
                testcases: [
                    V2V3TestCaseV2(
                        metadata: V2V3TestCaseMetadata(
                            id: "id",
                            name: "name",
                            hidden: true
                        ),
                        implementation: V2V3TestCaseImplementationReference.v2V3TestCaseImplementationReferenceType(
                            V2V3TestCaseImplementationReferenceType(
                                type: .templateId
                            )
                        ),
                        arguments: [
                            "key": VariableValue.variableValueZero(
                                VariableValueZero(
                                    type: .integerValue
                                )
                            )
                        ]
                    )
                ],
                isPublic: true
            )
        ]
        let response = try await client.v2V3Problem.v2V3ProblemGetProblems(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func v2V3ProblemGetProblems2() async throws -> Void {
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
                          "value": "value"
                        },
                        {
                          "type": "html",
                          "value": "value"
                        }
                      ]
                    },
                    "problemName": "problemName",
                    "problemVersion": 1,
                    "supportedLanguages": [
                      "JAVA",
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
                        "additionalFiles": {
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
                              "value": "value"
                            },
                            {
                              "type": "html",
                              "value": "value"
                            }
                          ]
                        },
                        "expectedValueParameterId": "expectedValueParameterId"
                      }
                    },
                    "generatedFiles": {
                      "generatedTestCaseFiles": {
                        "generatedTestCaseFiles": {
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
                        "generatedTemplateFiles": {
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
                        "other": {
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
                                "value": "value"
                              },
                              {
                                "type": "html",
                                "value": "value"
                              }
                            ]
                          },
                          "function": {
                            "type": "custom",
                            "parameters": [],
                            "code": {
                              "codeByLanguage": {
                                "codeByLanguage": {
                                  "impl": "impl"
                                }
                              }
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
                                "value": "value"
                              },
                              {
                                "type": "html",
                                "value": "value"
                              }
                            ]
                          },
                          "function": {
                            "type": "custom",
                            "parameters": [],
                            "code": {
                              "codeByLanguage": {
                                "codeByLanguage": {
                                  "impl": "impl"
                                }
                              }
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
                          "value": "value"
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
                          "value": "value"
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
                          "value": "value"
                        },
                        {
                          "type": "html",
                          "value": "value"
                        }
                      ]
                    },
                    "problemName": "problemName",
                    "problemVersion": 1,
                    "supportedLanguages": [
                      "JAVA",
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
                        "additionalFiles": {
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
                              "value": "value"
                            },
                            {
                              "type": "html",
                              "value": "value"
                            }
                          ]
                        },
                        "expectedValueParameterId": "expectedValueParameterId"
                      }
                    },
                    "generatedFiles": {
                      "generatedTestCaseFiles": {
                        "generatedTestCaseFiles": {
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
                        "generatedTemplateFiles": {
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
                        "other": {
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
                                "value": "value"
                              },
                              {
                                "type": "html",
                                "value": "value"
                              }
                            ]
                          },
                          "function": {
                            "type": "custom",
                            "parameters": [],
                            "code": {
                              "codeByLanguage": {
                                "codeByLanguage": {
                                  "impl": "impl"
                                }
                              }
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
                                "value": "value"
                              },
                              {
                                "type": "html",
                                "value": "value"
                              }
                            ]
                          },
                          "function": {
                            "type": "custom",
                            "parameters": [],
                            "code": {
                              "codeByLanguage": {
                                "codeByLanguage": {
                                  "impl": "impl"
                                }
                              }
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
                          "value": "value"
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
                          "value": "value"
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
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            V2V3ProblemInfoV2(
                problemId: "problemId",
                problemDescription: ProblemDescription(
                    boards: [
                        ProblemDescriptionBoard.html(
                            .init(
                                value: Optional("value"),
                                additionalProperties: [
                                    "type": JSONValue.string("html")
                                ]
                            )
                        ),
                        ProblemDescriptionBoard.html(
                            .init(
                                value: Optional("value"),
                                additionalProperties: [
                                    "type": JSONValue.string("html")
                                ]
                            )
                        )
                    ]
                ),
                problemName: "problemName",
                problemVersion: 1,
                supportedLanguages: [
                    .java,
                    .java
                ],
                customFiles: V2V3CustomFiles.v2V3CustomFilesZero(
                    V2V3CustomFilesZero(
                        type: .basic,
                        methodName: "methodName",
                        signature: V2V3NonVoidFunctionSignature(
                            parameters: [
                                V2V3Parameter(
                                    parameterId: "parameterId",
                                    name: "name",
                                    variableType: VariableType.variableTypeZero(
                                        VariableTypeZero(
                                            type: .integerType
                                        )
                                    )
                                ),
                                V2V3Parameter(
                                    parameterId: "parameterId",
                                    name: "name",
                                    variableType: VariableType.variableTypeZero(
                                        VariableTypeZero(
                                            type: .integerType
                                        )
                                    )
                                )
                            ],
                            returnType: VariableType.variableTypeZero(
                                VariableTypeZero(
                                    type: .integerType
                                )
                            )
                        ),
                        additionalFiles: [
                            "additionalFiles": V2V3Files(
                                files: [
                                    V2V3FileInfoV2(
                                        filename: "filename",
                                        directory: "directory",
                                        contents: "contents",
                                        editable: true
                                    ),
                                    V2V3FileInfoV2(
                                        filename: "filename",
                                        directory: "directory",
                                        contents: "contents",
                                        editable: true
                                    )
                                ]
                            )
                        ],
                        basicTestCaseTemplate: V2V3BasicTestCaseTemplate(
                            templateId: "templateId",
                            name: "name",
                            description: V2V3TestCaseImplementationDescription(
                                boards: [
                                    V2V3TestCaseImplementationDescriptionBoard.html(
                                        .init(
                                            value: Optional("value"),
                                            additionalProperties: [
                                                "type": JSONValue.string("html")
                                            ]
                                        )
                                    ),
                                    V2V3TestCaseImplementationDescriptionBoard.html(
                                        .init(
                                            value: Optional("value"),
                                            additionalProperties: [
                                                "type": JSONValue.string("html")
                                            ]
                                        )
                                    )
                                ]
                            ),
                            expectedValueParameterId: "expectedValueParameterId"
                        )
                    )
                ),
                generatedFiles: V2V3GeneratedFiles(
                    generatedTestCaseFiles: [
                        "generatedTestCaseFiles": V2V3Files(
                            files: [
                                V2V3FileInfoV2(
                                    filename: "filename",
                                    directory: "directory",
                                    contents: "contents",
                                    editable: true
                                ),
                                V2V3FileInfoV2(
                                    filename: "filename",
                                    directory: "directory",
                                    contents: "contents",
                                    editable: true
                                )
                            ]
                        )
                    ],
                    generatedTemplateFiles: [
                        "generatedTemplateFiles": V2V3Files(
                            files: [
                                V2V3FileInfoV2(
                                    filename: "filename",
                                    directory: "directory",
                                    contents: "contents",
                                    editable: true
                                ),
                                V2V3FileInfoV2(
                                    filename: "filename",
                                    directory: "directory",
                                    contents: "contents",
                                    editable: true
                                )
                            ]
                        )
                    ],
                    other: [
                        "other": V2V3Files(
                            files: [
                                V2V3FileInfoV2(
                                    filename: "filename",
                                    directory: "directory",
                                    contents: "contents",
                                    editable: true
                                ),
                                V2V3FileInfoV2(
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
                    V2V3TestCaseTemplate(
                        templateId: "templateId",
                        name: "name",
                        implementation: V2V3TestCaseImplementation(
                            description: V2V3TestCaseImplementationDescription(
                                boards: [
                                    V2V3TestCaseImplementationDescriptionBoard.html(
                                        .init(
                                            value: Optional("value"),
                                            additionalProperties: [
                                                "type": JSONValue.string("html")
                                            ]
                                        )
                                    ),
                                    V2V3TestCaseImplementationDescriptionBoard.html(
                                        .init(
                                            value: Optional("value"),
                                            additionalProperties: [
                                                "type": JSONValue.string("html")
                                            ]
                                        )
                                    )
                                ]
                            ),
                            function: V2V3TestCaseFunction.v2V3TestCaseFunctionOne(
                                V2V3TestCaseFunctionOne(
                                    type: .custom,
                                    parameters: [],
                                    code: V2V3FunctionImplementationForMultipleLanguages(
                                        codeByLanguage: [
                                            "codeByLanguage": V2V3FunctionImplementation(
                                                impl: "impl"
                                            )
                                        ]
                                    )
                                )
                            )
                        )
                    ),
                    V2V3TestCaseTemplate(
                        templateId: "templateId",
                        name: "name",
                        implementation: V2V3TestCaseImplementation(
                            description: V2V3TestCaseImplementationDescription(
                                boards: [
                                    V2V3TestCaseImplementationDescriptionBoard.html(
                                        .init(
                                            value: Optional("value"),
                                            additionalProperties: [
                                                "type": JSONValue.string("html")
                                            ]
                                        )
                                    ),
                                    V2V3TestCaseImplementationDescriptionBoard.html(
                                        .init(
                                            value: Optional("value"),
                                            additionalProperties: [
                                                "type": JSONValue.string("html")
                                            ]
                                        )
                                    )
                                ]
                            ),
                            function: V2V3TestCaseFunction.v2V3TestCaseFunctionOne(
                                V2V3TestCaseFunctionOne(
                                    type: .custom,
                                    parameters: [],
                                    code: V2V3FunctionImplementationForMultipleLanguages(
                                        codeByLanguage: [
                                            "codeByLanguage": V2V3FunctionImplementation(
                                                impl: "impl"
                                            )
                                        ]
                                    )
                                )
                            )
                        )
                    )
                ],
                testcases: [
                    V2V3TestCaseV2(
                        metadata: V2V3TestCaseMetadata(
                            id: "id",
                            name: "name",
                            hidden: true
                        ),
                        implementation: V2V3TestCaseImplementationReference.v2V3TestCaseImplementationReferenceType(
                            V2V3TestCaseImplementationReferenceType(
                                type: .templateId,
                                value: Optional("value")
                            )
                        ),
                        arguments: [
                            "arguments": VariableValue.variableValueZero(
                                VariableValueZero(
                                    type: .integerValue,
                                    value: Optional(1)
                                )
                            )
                        ],
                        expects: Optional(V2V3TestCaseExpects(
                            expectedStdout: Optional(Nullable<String>.value("expectedStdout"))
                        ))
                    ),
                    V2V3TestCaseV2(
                        metadata: V2V3TestCaseMetadata(
                            id: "id",
                            name: "name",
                            hidden: true
                        ),
                        implementation: V2V3TestCaseImplementationReference.v2V3TestCaseImplementationReferenceType(
                            V2V3TestCaseImplementationReferenceType(
                                type: .templateId,
                                value: Optional("value")
                            )
                        ),
                        arguments: [
                            "arguments": VariableValue.variableValueZero(
                                VariableValueZero(
                                    type: .integerValue,
                                    value: Optional(1)
                                )
                            )
                        ],
                        expects: Optional(V2V3TestCaseExpects(
                            expectedStdout: Optional(Nullable<String>.value("expectedStdout"))
                        ))
                    )
                ],
                isPublic: true
            ),
            V2V3ProblemInfoV2(
                problemId: "problemId",
                problemDescription: ProblemDescription(
                    boards: [
                        ProblemDescriptionBoard.html(
                            .init(
                                value: Optional("value"),
                                additionalProperties: [
                                    "type": JSONValue.string("html")
                                ]
                            )
                        ),
                        ProblemDescriptionBoard.html(
                            .init(
                                value: Optional("value"),
                                additionalProperties: [
                                    "type": JSONValue.string("html")
                                ]
                            )
                        )
                    ]
                ),
                problemName: "problemName",
                problemVersion: 1,
                supportedLanguages: [
                    .java,
                    .java
                ],
                customFiles: V2V3CustomFiles.v2V3CustomFilesZero(
                    V2V3CustomFilesZero(
                        type: .basic,
                        methodName: "methodName",
                        signature: V2V3NonVoidFunctionSignature(
                            parameters: [
                                V2V3Parameter(
                                    parameterId: "parameterId",
                                    name: "name",
                                    variableType: VariableType.variableTypeZero(
                                        VariableTypeZero(
                                            type: .integerType
                                        )
                                    )
                                ),
                                V2V3Parameter(
                                    parameterId: "parameterId",
                                    name: "name",
                                    variableType: VariableType.variableTypeZero(
                                        VariableTypeZero(
                                            type: .integerType
                                        )
                                    )
                                )
                            ],
                            returnType: VariableType.variableTypeZero(
                                VariableTypeZero(
                                    type: .integerType
                                )
                            )
                        ),
                        additionalFiles: [
                            "additionalFiles": V2V3Files(
                                files: [
                                    V2V3FileInfoV2(
                                        filename: "filename",
                                        directory: "directory",
                                        contents: "contents",
                                        editable: true
                                    ),
                                    V2V3FileInfoV2(
                                        filename: "filename",
                                        directory: "directory",
                                        contents: "contents",
                                        editable: true
                                    )
                                ]
                            )
                        ],
                        basicTestCaseTemplate: V2V3BasicTestCaseTemplate(
                            templateId: "templateId",
                            name: "name",
                            description: V2V3TestCaseImplementationDescription(
                                boards: [
                                    V2V3TestCaseImplementationDescriptionBoard.html(
                                        .init(
                                            value: Optional("value"),
                                            additionalProperties: [
                                                "type": JSONValue.string("html")
                                            ]
                                        )
                                    ),
                                    V2V3TestCaseImplementationDescriptionBoard.html(
                                        .init(
                                            value: Optional("value"),
                                            additionalProperties: [
                                                "type": JSONValue.string("html")
                                            ]
                                        )
                                    )
                                ]
                            ),
                            expectedValueParameterId: "expectedValueParameterId"
                        )
                    )
                ),
                generatedFiles: V2V3GeneratedFiles(
                    generatedTestCaseFiles: [
                        "generatedTestCaseFiles": V2V3Files(
                            files: [
                                V2V3FileInfoV2(
                                    filename: "filename",
                                    directory: "directory",
                                    contents: "contents",
                                    editable: true
                                ),
                                V2V3FileInfoV2(
                                    filename: "filename",
                                    directory: "directory",
                                    contents: "contents",
                                    editable: true
                                )
                            ]
                        )
                    ],
                    generatedTemplateFiles: [
                        "generatedTemplateFiles": V2V3Files(
                            files: [
                                V2V3FileInfoV2(
                                    filename: "filename",
                                    directory: "directory",
                                    contents: "contents",
                                    editable: true
                                ),
                                V2V3FileInfoV2(
                                    filename: "filename",
                                    directory: "directory",
                                    contents: "contents",
                                    editable: true
                                )
                            ]
                        )
                    ],
                    other: [
                        "other": V2V3Files(
                            files: [
                                V2V3FileInfoV2(
                                    filename: "filename",
                                    directory: "directory",
                                    contents: "contents",
                                    editable: true
                                ),
                                V2V3FileInfoV2(
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
                    V2V3TestCaseTemplate(
                        templateId: "templateId",
                        name: "name",
                        implementation: V2V3TestCaseImplementation(
                            description: V2V3TestCaseImplementationDescription(
                                boards: [
                                    V2V3TestCaseImplementationDescriptionBoard.html(
                                        .init(
                                            value: Optional("value"),
                                            additionalProperties: [
                                                "type": JSONValue.string("html")
                                            ]
                                        )
                                    ),
                                    V2V3TestCaseImplementationDescriptionBoard.html(
                                        .init(
                                            value: Optional("value"),
                                            additionalProperties: [
                                                "type": JSONValue.string("html")
                                            ]
                                        )
                                    )
                                ]
                            ),
                            function: V2V3TestCaseFunction.v2V3TestCaseFunctionOne(
                                V2V3TestCaseFunctionOne(
                                    type: .custom,
                                    parameters: [],
                                    code: V2V3FunctionImplementationForMultipleLanguages(
                                        codeByLanguage: [
                                            "codeByLanguage": V2V3FunctionImplementation(
                                                impl: "impl"
                                            )
                                        ]
                                    )
                                )
                            )
                        )
                    ),
                    V2V3TestCaseTemplate(
                        templateId: "templateId",
                        name: "name",
                        implementation: V2V3TestCaseImplementation(
                            description: V2V3TestCaseImplementationDescription(
                                boards: [
                                    V2V3TestCaseImplementationDescriptionBoard.html(
                                        .init(
                                            value: Optional("value"),
                                            additionalProperties: [
                                                "type": JSONValue.string("html")
                                            ]
                                        )
                                    ),
                                    V2V3TestCaseImplementationDescriptionBoard.html(
                                        .init(
                                            value: Optional("value"),
                                            additionalProperties: [
                                                "type": JSONValue.string("html")
                                            ]
                                        )
                                    )
                                ]
                            ),
                            function: V2V3TestCaseFunction.v2V3TestCaseFunctionOne(
                                V2V3TestCaseFunctionOne(
                                    type: .custom,
                                    parameters: [],
                                    code: V2V3FunctionImplementationForMultipleLanguages(
                                        codeByLanguage: [
                                            "codeByLanguage": V2V3FunctionImplementation(
                                                impl: "impl"
                                            )
                                        ]
                                    )
                                )
                            )
                        )
                    )
                ],
                testcases: [
                    V2V3TestCaseV2(
                        metadata: V2V3TestCaseMetadata(
                            id: "id",
                            name: "name",
                            hidden: true
                        ),
                        implementation: V2V3TestCaseImplementationReference.v2V3TestCaseImplementationReferenceType(
                            V2V3TestCaseImplementationReferenceType(
                                type: .templateId,
                                value: Optional("value")
                            )
                        ),
                        arguments: [
                            "arguments": VariableValue.variableValueZero(
                                VariableValueZero(
                                    type: .integerValue,
                                    value: Optional(1)
                                )
                            )
                        ],
                        expects: Optional(V2V3TestCaseExpects(
                            expectedStdout: Optional(Nullable<String>.value("expectedStdout"))
                        ))
                    ),
                    V2V3TestCaseV2(
                        metadata: V2V3TestCaseMetadata(
                            id: "id",
                            name: "name",
                            hidden: true
                        ),
                        implementation: V2V3TestCaseImplementationReference.v2V3TestCaseImplementationReferenceType(
                            V2V3TestCaseImplementationReferenceType(
                                type: .templateId,
                                value: Optional("value")
                            )
                        ),
                        arguments: [
                            "arguments": VariableValue.variableValueZero(
                                VariableValueZero(
                                    type: .integerValue,
                                    value: Optional(1)
                                )
                            )
                        ],
                        expects: Optional(V2V3TestCaseExpects(
                            expectedStdout: Optional(Nullable<String>.value("expectedStdout"))
                        ))
                    )
                ],
                isPublic: true
            )
        ]
        let response = try await client.v2V3Problem.v2V3ProblemGetProblems(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func v2V3ProblemGetLatestProblem1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "problemId": "problemId",
                  "problemDescription": {
                    "boards": [
                      {
                        "type": "html"
                      }
                    ]
                  },
                  "problemName": "problemName",
                  "problemVersion": 1,
                  "supportedLanguages": [
                    "JAVA"
                  ],
                  "customFiles": {
                    "methodName": "methodName",
                    "signature": {
                      "parameters": [
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
                      "key": {
                        "files": [
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
                            "type": "html"
                          }
                        ]
                      },
                      "expectedValueParameterId": "expectedValueParameterId"
                    },
                    "type": "basic"
                  },
                  "generatedFiles": {
                    "generatedTestCaseFiles": {
                      "key": {
                        "files": [
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
                      "key": {
                        "files": [
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
                      "key": {
                        "files": [
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
                              "type": "html"
                            }
                          ]
                        },
                        "function": {
                          "getActualResult": {
                            "signature": {
                              "parameters": [
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
                                "key": {
                                  "impl": "impl"
                                }
                              }
                            }
                          },
                          "assertCorrectnessCheck": {
                            "expectedValueParameterId": "expectedValueParameterId",
                            "type": "deepEquality"
                          },
                          "type": "withActualResult"
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
                        "type": "templateId"
                      },
                      "arguments": {
                        "key": {
                          "type": "integerValue"
                        }
                      }
                    }
                  ],
                  "isPublic": true
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = V2V3ProblemInfoV2(
            problemId: "problemId",
            problemDescription: ProblemDescription(
                boards: [
                    ProblemDescriptionBoard.html(
                        .init(
                            additionalProperties: [
                                "type": JSONValue.string("html")
                            ]
                        )
                    )
                ]
            ),
            problemName: "problemName",
            problemVersion: 1,
            supportedLanguages: [
                .java
            ],
            customFiles: V2V3CustomFiles.v2V3CustomFilesZero(
                V2V3CustomFilesZero(
                    methodName: "methodName",
                    signature: V2V3NonVoidFunctionSignature(
                        parameters: [
                            V2V3Parameter(
                                parameterId: "parameterId",
                                name: "name",
                                variableType: VariableType.variableTypeZero(
                                    VariableTypeZero(
                                        type: .integerType
                                    )
                                )
                            )
                        ],
                        returnType: VariableType.variableTypeZero(
                            VariableTypeZero(
                                type: .integerType
                            )
                        )
                    ),
                    additionalFiles: [
                        "key": V2V3Files(
                            files: [
                                V2V3FileInfoV2(
                                    filename: "filename",
                                    directory: "directory",
                                    contents: "contents",
                                    editable: true
                                )
                            ]
                        )
                    ],
                    basicTestCaseTemplate: V2V3BasicTestCaseTemplate(
                        templateId: "templateId",
                        name: "name",
                        description: V2V3TestCaseImplementationDescription(
                            boards: [
                                V2V3TestCaseImplementationDescriptionBoard.html(
                                    .init(
                                        additionalProperties: [
                                            "type": JSONValue.string("html")
                                        ]
                                    )
                                )
                            ]
                        ),
                        expectedValueParameterId: "expectedValueParameterId"
                    ),
                    type: .basic
                )
            ),
            generatedFiles: V2V3GeneratedFiles(
                generatedTestCaseFiles: [
                    "key": V2V3Files(
                        files: [
                            V2V3FileInfoV2(
                                filename: "filename",
                                directory: "directory",
                                contents: "contents",
                                editable: true
                            )
                        ]
                    )
                ],
                generatedTemplateFiles: [
                    "key": V2V3Files(
                        files: [
                            V2V3FileInfoV2(
                                filename: "filename",
                                directory: "directory",
                                contents: "contents",
                                editable: true
                            )
                        ]
                    )
                ],
                other: [
                    "key": V2V3Files(
                        files: [
                            V2V3FileInfoV2(
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
                V2V3TestCaseTemplate(
                    templateId: "templateId",
                    name: "name",
                    implementation: V2V3TestCaseImplementation(
                        description: V2V3TestCaseImplementationDescription(
                            boards: [
                                V2V3TestCaseImplementationDescriptionBoard.html(
                                    .init(
                                        additionalProperties: [
                                            "type": JSONValue.string("html")
                                        ]
                                    )
                                )
                            ]
                        ),
                        function: V2V3TestCaseFunction.v2V3TestCaseFunctionZero(
                            V2V3TestCaseFunctionZero(
                                getActualResult: V2V3NonVoidFunctionDefinition(
                                    signature: V2V3NonVoidFunctionSignature(
                                        parameters: [
                                            V2V3Parameter(
                                                parameterId: "parameterId",
                                                name: "name",
                                                variableType: VariableType.variableTypeZero(
                                                    VariableTypeZero(
                                                        type: .integerType
                                                    )
                                                )
                                            )
                                        ],
                                        returnType: VariableType.variableTypeZero(
                                            VariableTypeZero(
                                                type: .integerType
                                            )
                                        )
                                    ),
                                    code: V2V3FunctionImplementationForMultipleLanguages(
                                        codeByLanguage: [
                                            "key": V2V3FunctionImplementation(
                                                impl: "impl"
                                            )
                                        ]
                                    )
                                ),
                                assertCorrectnessCheck: V2V3AssertCorrectnessCheck.v2V3AssertCorrectnessCheckZero(
                                    V2V3AssertCorrectnessCheckZero(
                                        expectedValueParameterId: "expectedValueParameterId",
                                        type: .deepEquality
                                    )
                                ),
                                type: .withActualResult
                            )
                        )
                    )
                )
            ],
            testcases: [
                V2V3TestCaseV2(
                    metadata: V2V3TestCaseMetadata(
                        id: "id",
                        name: "name",
                        hidden: true
                    ),
                    implementation: V2V3TestCaseImplementationReference.v2V3TestCaseImplementationReferenceType(
                        V2V3TestCaseImplementationReferenceType(
                            type: .templateId
                        )
                    ),
                    arguments: [
                        "key": VariableValue.variableValueZero(
                            VariableValueZero(
                                type: .integerValue
                            )
                        )
                    ]
                )
            ],
            isPublic: true
        )
        let response = try await client.v2V3Problem.v2V3ProblemGetLatestProblem(
            problemId: "problemId",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func v2V3ProblemGetLatestProblem2() async throws -> Void {
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
                        "value": "value"
                      },
                      {
                        "type": "html",
                        "value": "value"
                      }
                    ]
                  },
                  "problemName": "problemName",
                  "problemVersion": 1,
                  "supportedLanguages": [
                    "JAVA",
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
                      "additionalFiles": {
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
                            "value": "value"
                          },
                          {
                            "type": "html",
                            "value": "value"
                          }
                        ]
                      },
                      "expectedValueParameterId": "expectedValueParameterId"
                    }
                  },
                  "generatedFiles": {
                    "generatedTestCaseFiles": {
                      "generatedTestCaseFiles": {
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
                      "generatedTemplateFiles": {
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
                      "other": {
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
                              "value": "value"
                            },
                            {
                              "type": "html",
                              "value": "value"
                            }
                          ]
                        },
                        "function": {
                          "type": "withActualResult",
                          "getActualResult": {
                            "signature": {
                              "parameters": [],
                              "returnType": {
                                "type": "integerType"
                              }
                            },
                            "code": {
                              "codeByLanguage": {
                                "codeByLanguage": {
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
                              "value": "value"
                            },
                            {
                              "type": "html",
                              "value": "value"
                            }
                          ]
                        },
                        "function": {
                          "type": "withActualResult",
                          "getActualResult": {
                            "signature": {
                              "parameters": [],
                              "returnType": {
                                "type": "integerType"
                              }
                            },
                            "code": {
                              "codeByLanguage": {
                                "codeByLanguage": {
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
                        "value": "value"
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
                        "value": "value"
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
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = V2V3ProblemInfoV2(
            problemId: "problemId",
            problemDescription: ProblemDescription(
                boards: [
                    ProblemDescriptionBoard.html(
                        .init(
                            value: Optional("value"),
                            additionalProperties: [
                                "type": JSONValue.string("html")
                            ]
                        )
                    ),
                    ProblemDescriptionBoard.html(
                        .init(
                            value: Optional("value"),
                            additionalProperties: [
                                "type": JSONValue.string("html")
                            ]
                        )
                    )
                ]
            ),
            problemName: "problemName",
            problemVersion: 1,
            supportedLanguages: [
                .java,
                .java
            ],
            customFiles: V2V3CustomFiles.v2V3CustomFilesZero(
                V2V3CustomFilesZero(
                    type: .basic,
                    methodName: "methodName",
                    signature: V2V3NonVoidFunctionSignature(
                        parameters: [
                            V2V3Parameter(
                                parameterId: "parameterId",
                                name: "name",
                                variableType: VariableType.variableTypeZero(
                                    VariableTypeZero(
                                        type: .integerType
                                    )
                                )
                            ),
                            V2V3Parameter(
                                parameterId: "parameterId",
                                name: "name",
                                variableType: VariableType.variableTypeZero(
                                    VariableTypeZero(
                                        type: .integerType
                                    )
                                )
                            )
                        ],
                        returnType: VariableType.variableTypeZero(
                            VariableTypeZero(
                                type: .integerType
                            )
                        )
                    ),
                    additionalFiles: [
                        "additionalFiles": V2V3Files(
                            files: [
                                V2V3FileInfoV2(
                                    filename: "filename",
                                    directory: "directory",
                                    contents: "contents",
                                    editable: true
                                ),
                                V2V3FileInfoV2(
                                    filename: "filename",
                                    directory: "directory",
                                    contents: "contents",
                                    editable: true
                                )
                            ]
                        )
                    ],
                    basicTestCaseTemplate: V2V3BasicTestCaseTemplate(
                        templateId: "templateId",
                        name: "name",
                        description: V2V3TestCaseImplementationDescription(
                            boards: [
                                V2V3TestCaseImplementationDescriptionBoard.html(
                                    .init(
                                        value: Optional("value"),
                                        additionalProperties: [
                                            "type": JSONValue.string("html")
                                        ]
                                    )
                                ),
                                V2V3TestCaseImplementationDescriptionBoard.html(
                                    .init(
                                        value: Optional("value"),
                                        additionalProperties: [
                                            "type": JSONValue.string("html")
                                        ]
                                    )
                                )
                            ]
                        ),
                        expectedValueParameterId: "expectedValueParameterId"
                    )
                )
            ),
            generatedFiles: V2V3GeneratedFiles(
                generatedTestCaseFiles: [
                    "generatedTestCaseFiles": V2V3Files(
                        files: [
                            V2V3FileInfoV2(
                                filename: "filename",
                                directory: "directory",
                                contents: "contents",
                                editable: true
                            ),
                            V2V3FileInfoV2(
                                filename: "filename",
                                directory: "directory",
                                contents: "contents",
                                editable: true
                            )
                        ]
                    )
                ],
                generatedTemplateFiles: [
                    "generatedTemplateFiles": V2V3Files(
                        files: [
                            V2V3FileInfoV2(
                                filename: "filename",
                                directory: "directory",
                                contents: "contents",
                                editable: true
                            ),
                            V2V3FileInfoV2(
                                filename: "filename",
                                directory: "directory",
                                contents: "contents",
                                editable: true
                            )
                        ]
                    )
                ],
                other: [
                    "other": V2V3Files(
                        files: [
                            V2V3FileInfoV2(
                                filename: "filename",
                                directory: "directory",
                                contents: "contents",
                                editable: true
                            ),
                            V2V3FileInfoV2(
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
                V2V3TestCaseTemplate(
                    templateId: "templateId",
                    name: "name",
                    implementation: V2V3TestCaseImplementation(
                        description: V2V3TestCaseImplementationDescription(
                            boards: [
                                V2V3TestCaseImplementationDescriptionBoard.html(
                                    .init(
                                        value: Optional("value"),
                                        additionalProperties: [
                                            "type": JSONValue.string("html")
                                        ]
                                    )
                                ),
                                V2V3TestCaseImplementationDescriptionBoard.html(
                                    .init(
                                        value: Optional("value"),
                                        additionalProperties: [
                                            "type": JSONValue.string("html")
                                        ]
                                    )
                                )
                            ]
                        ),
                        function: V2V3TestCaseFunction.v2V3TestCaseFunctionZero(
                            V2V3TestCaseFunctionZero(
                                type: .withActualResult,
                                getActualResult: V2V3NonVoidFunctionDefinition(
                                    signature: V2V3NonVoidFunctionSignature(
                                        parameters: [],
                                        returnType: VariableType.variableTypeZero(
                                            VariableTypeZero(
                                                type: .integerType
                                            )
                                        )
                                    ),
                                    code: V2V3FunctionImplementationForMultipleLanguages(
                                        codeByLanguage: [
                                            "codeByLanguage": V2V3FunctionImplementation(
                                                impl: "impl"
                                            )
                                        ]
                                    )
                                ),
                                assertCorrectnessCheck: V2V3AssertCorrectnessCheck.v2V3AssertCorrectnessCheckZero(
                                    V2V3AssertCorrectnessCheckZero(
                                        type: .deepEquality,
                                        expectedValueParameterId: "expectedValueParameterId"
                                    )
                                )
                            )
                        )
                    )
                ),
                V2V3TestCaseTemplate(
                    templateId: "templateId",
                    name: "name",
                    implementation: V2V3TestCaseImplementation(
                        description: V2V3TestCaseImplementationDescription(
                            boards: [
                                V2V3TestCaseImplementationDescriptionBoard.html(
                                    .init(
                                        value: Optional("value"),
                                        additionalProperties: [
                                            "type": JSONValue.string("html")
                                        ]
                                    )
                                ),
                                V2V3TestCaseImplementationDescriptionBoard.html(
                                    .init(
                                        value: Optional("value"),
                                        additionalProperties: [
                                            "type": JSONValue.string("html")
                                        ]
                                    )
                                )
                            ]
                        ),
                        function: V2V3TestCaseFunction.v2V3TestCaseFunctionZero(
                            V2V3TestCaseFunctionZero(
                                type: .withActualResult,
                                getActualResult: V2V3NonVoidFunctionDefinition(
                                    signature: V2V3NonVoidFunctionSignature(
                                        parameters: [],
                                        returnType: VariableType.variableTypeZero(
                                            VariableTypeZero(
                                                type: .integerType
                                            )
                                        )
                                    ),
                                    code: V2V3FunctionImplementationForMultipleLanguages(
                                        codeByLanguage: [
                                            "codeByLanguage": V2V3FunctionImplementation(
                                                impl: "impl"
                                            )
                                        ]
                                    )
                                ),
                                assertCorrectnessCheck: V2V3AssertCorrectnessCheck.v2V3AssertCorrectnessCheckZero(
                                    V2V3AssertCorrectnessCheckZero(
                                        type: .deepEquality,
                                        expectedValueParameterId: "expectedValueParameterId"
                                    )
                                )
                            )
                        )
                    )
                )
            ],
            testcases: [
                V2V3TestCaseV2(
                    metadata: V2V3TestCaseMetadata(
                        id: "id",
                        name: "name",
                        hidden: true
                    ),
                    implementation: V2V3TestCaseImplementationReference.v2V3TestCaseImplementationReferenceType(
                        V2V3TestCaseImplementationReferenceType(
                            type: .templateId,
                            value: Optional("value")
                        )
                    ),
                    arguments: [
                        "arguments": VariableValue.variableValueZero(
                            VariableValueZero(
                                type: .integerValue,
                                value: Optional(1)
                            )
                        )
                    ],
                    expects: Optional(V2V3TestCaseExpects(
                        expectedStdout: Optional(Nullable<String>.value("expectedStdout"))
                    ))
                ),
                V2V3TestCaseV2(
                    metadata: V2V3TestCaseMetadata(
                        id: "id",
                        name: "name",
                        hidden: true
                    ),
                    implementation: V2V3TestCaseImplementationReference.v2V3TestCaseImplementationReferenceType(
                        V2V3TestCaseImplementationReferenceType(
                            type: .templateId,
                            value: Optional("value")
                        )
                    ),
                    arguments: [
                        "arguments": VariableValue.variableValueZero(
                            VariableValueZero(
                                type: .integerValue,
                                value: Optional(1)
                            )
                        )
                    ],
                    expects: Optional(V2V3TestCaseExpects(
                        expectedStdout: Optional(Nullable<String>.value("expectedStdout"))
                    ))
                )
            ],
            isPublic: true
        )
        let response = try await client.v2V3Problem.v2V3ProblemGetLatestProblem(
            problemId: "problemId",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func v2V3ProblemGetProblemVersion1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "problemId": "problemId",
                  "problemDescription": {
                    "boards": [
                      {
                        "type": "html"
                      }
                    ]
                  },
                  "problemName": "problemName",
                  "problemVersion": 1,
                  "supportedLanguages": [
                    "JAVA"
                  ],
                  "customFiles": {
                    "methodName": "methodName",
                    "signature": {
                      "parameters": [
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
                      "key": {
                        "files": [
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
                            "type": "html"
                          }
                        ]
                      },
                      "expectedValueParameterId": "expectedValueParameterId"
                    },
                    "type": "basic"
                  },
                  "generatedFiles": {
                    "generatedTestCaseFiles": {
                      "key": {
                        "files": [
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
                      "key": {
                        "files": [
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
                      "key": {
                        "files": [
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
                              "type": "html"
                            }
                          ]
                        },
                        "function": {
                          "getActualResult": {
                            "signature": {
                              "parameters": [
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
                                "key": {
                                  "impl": "impl"
                                }
                              }
                            }
                          },
                          "assertCorrectnessCheck": {
                            "expectedValueParameterId": "expectedValueParameterId",
                            "type": "deepEquality"
                          },
                          "type": "withActualResult"
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
                        "type": "templateId"
                      },
                      "arguments": {
                        "key": {
                          "type": "integerValue"
                        }
                      }
                    }
                  ],
                  "isPublic": true
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = V2V3ProblemInfoV2(
            problemId: "problemId",
            problemDescription: ProblemDescription(
                boards: [
                    ProblemDescriptionBoard.html(
                        .init(
                            additionalProperties: [
                                "type": JSONValue.string("html")
                            ]
                        )
                    )
                ]
            ),
            problemName: "problemName",
            problemVersion: 1,
            supportedLanguages: [
                .java
            ],
            customFiles: V2V3CustomFiles.v2V3CustomFilesZero(
                V2V3CustomFilesZero(
                    methodName: "methodName",
                    signature: V2V3NonVoidFunctionSignature(
                        parameters: [
                            V2V3Parameter(
                                parameterId: "parameterId",
                                name: "name",
                                variableType: VariableType.variableTypeZero(
                                    VariableTypeZero(
                                        type: .integerType
                                    )
                                )
                            )
                        ],
                        returnType: VariableType.variableTypeZero(
                            VariableTypeZero(
                                type: .integerType
                            )
                        )
                    ),
                    additionalFiles: [
                        "key": V2V3Files(
                            files: [
                                V2V3FileInfoV2(
                                    filename: "filename",
                                    directory: "directory",
                                    contents: "contents",
                                    editable: true
                                )
                            ]
                        )
                    ],
                    basicTestCaseTemplate: V2V3BasicTestCaseTemplate(
                        templateId: "templateId",
                        name: "name",
                        description: V2V3TestCaseImplementationDescription(
                            boards: [
                                V2V3TestCaseImplementationDescriptionBoard.html(
                                    .init(
                                        additionalProperties: [
                                            "type": JSONValue.string("html")
                                        ]
                                    )
                                )
                            ]
                        ),
                        expectedValueParameterId: "expectedValueParameterId"
                    ),
                    type: .basic
                )
            ),
            generatedFiles: V2V3GeneratedFiles(
                generatedTestCaseFiles: [
                    "key": V2V3Files(
                        files: [
                            V2V3FileInfoV2(
                                filename: "filename",
                                directory: "directory",
                                contents: "contents",
                                editable: true
                            )
                        ]
                    )
                ],
                generatedTemplateFiles: [
                    "key": V2V3Files(
                        files: [
                            V2V3FileInfoV2(
                                filename: "filename",
                                directory: "directory",
                                contents: "contents",
                                editable: true
                            )
                        ]
                    )
                ],
                other: [
                    "key": V2V3Files(
                        files: [
                            V2V3FileInfoV2(
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
                V2V3TestCaseTemplate(
                    templateId: "templateId",
                    name: "name",
                    implementation: V2V3TestCaseImplementation(
                        description: V2V3TestCaseImplementationDescription(
                            boards: [
                                V2V3TestCaseImplementationDescriptionBoard.html(
                                    .init(
                                        additionalProperties: [
                                            "type": JSONValue.string("html")
                                        ]
                                    )
                                )
                            ]
                        ),
                        function: V2V3TestCaseFunction.v2V3TestCaseFunctionZero(
                            V2V3TestCaseFunctionZero(
                                getActualResult: V2V3NonVoidFunctionDefinition(
                                    signature: V2V3NonVoidFunctionSignature(
                                        parameters: [
                                            V2V3Parameter(
                                                parameterId: "parameterId",
                                                name: "name",
                                                variableType: VariableType.variableTypeZero(
                                                    VariableTypeZero(
                                                        type: .integerType
                                                    )
                                                )
                                            )
                                        ],
                                        returnType: VariableType.variableTypeZero(
                                            VariableTypeZero(
                                                type: .integerType
                                            )
                                        )
                                    ),
                                    code: V2V3FunctionImplementationForMultipleLanguages(
                                        codeByLanguage: [
                                            "key": V2V3FunctionImplementation(
                                                impl: "impl"
                                            )
                                        ]
                                    )
                                ),
                                assertCorrectnessCheck: V2V3AssertCorrectnessCheck.v2V3AssertCorrectnessCheckZero(
                                    V2V3AssertCorrectnessCheckZero(
                                        expectedValueParameterId: "expectedValueParameterId",
                                        type: .deepEquality
                                    )
                                ),
                                type: .withActualResult
                            )
                        )
                    )
                )
            ],
            testcases: [
                V2V3TestCaseV2(
                    metadata: V2V3TestCaseMetadata(
                        id: "id",
                        name: "name",
                        hidden: true
                    ),
                    implementation: V2V3TestCaseImplementationReference.v2V3TestCaseImplementationReferenceType(
                        V2V3TestCaseImplementationReferenceType(
                            type: .templateId
                        )
                    ),
                    arguments: [
                        "key": VariableValue.variableValueZero(
                            VariableValueZero(
                                type: .integerValue
                            )
                        )
                    ]
                )
            ],
            isPublic: true
        )
        let response = try await client.v2V3Problem.v2V3ProblemGetProblemVersion(
            problemId: "problemId",
            problemVersion: 1,
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func v2V3ProblemGetProblemVersion2() async throws -> Void {
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
                        "value": "value"
                      },
                      {
                        "type": "html",
                        "value": "value"
                      }
                    ]
                  },
                  "problemName": "problemName",
                  "problemVersion": 1,
                  "supportedLanguages": [
                    "JAVA",
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
                      "additionalFiles": {
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
                            "value": "value"
                          },
                          {
                            "type": "html",
                            "value": "value"
                          }
                        ]
                      },
                      "expectedValueParameterId": "expectedValueParameterId"
                    }
                  },
                  "generatedFiles": {
                    "generatedTestCaseFiles": {
                      "generatedTestCaseFiles": {
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
                      "generatedTemplateFiles": {
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
                      "other": {
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
                              "value": "value"
                            },
                            {
                              "type": "html",
                              "value": "value"
                            }
                          ]
                        },
                        "function": {
                          "type": "withActualResult",
                          "getActualResult": {
                            "signature": {
                              "parameters": [],
                              "returnType": {
                                "type": "integerType"
                              }
                            },
                            "code": {
                              "codeByLanguage": {
                                "codeByLanguage": {
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
                              "value": "value"
                            },
                            {
                              "type": "html",
                              "value": "value"
                            }
                          ]
                        },
                        "function": {
                          "type": "withActualResult",
                          "getActualResult": {
                            "signature": {
                              "parameters": [],
                              "returnType": {
                                "type": "integerType"
                              }
                            },
                            "code": {
                              "codeByLanguage": {
                                "codeByLanguage": {
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
                        "value": "value"
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
                        "value": "value"
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
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = V2V3ProblemInfoV2(
            problemId: "problemId",
            problemDescription: ProblemDescription(
                boards: [
                    ProblemDescriptionBoard.html(
                        .init(
                            value: Optional("value"),
                            additionalProperties: [
                                "type": JSONValue.string("html")
                            ]
                        )
                    ),
                    ProblemDescriptionBoard.html(
                        .init(
                            value: Optional("value"),
                            additionalProperties: [
                                "type": JSONValue.string("html")
                            ]
                        )
                    )
                ]
            ),
            problemName: "problemName",
            problemVersion: 1,
            supportedLanguages: [
                .java,
                .java
            ],
            customFiles: V2V3CustomFiles.v2V3CustomFilesZero(
                V2V3CustomFilesZero(
                    type: .basic,
                    methodName: "methodName",
                    signature: V2V3NonVoidFunctionSignature(
                        parameters: [
                            V2V3Parameter(
                                parameterId: "parameterId",
                                name: "name",
                                variableType: VariableType.variableTypeZero(
                                    VariableTypeZero(
                                        type: .integerType
                                    )
                                )
                            ),
                            V2V3Parameter(
                                parameterId: "parameterId",
                                name: "name",
                                variableType: VariableType.variableTypeZero(
                                    VariableTypeZero(
                                        type: .integerType
                                    )
                                )
                            )
                        ],
                        returnType: VariableType.variableTypeZero(
                            VariableTypeZero(
                                type: .integerType
                            )
                        )
                    ),
                    additionalFiles: [
                        "additionalFiles": V2V3Files(
                            files: [
                                V2V3FileInfoV2(
                                    filename: "filename",
                                    directory: "directory",
                                    contents: "contents",
                                    editable: true
                                ),
                                V2V3FileInfoV2(
                                    filename: "filename",
                                    directory: "directory",
                                    contents: "contents",
                                    editable: true
                                )
                            ]
                        )
                    ],
                    basicTestCaseTemplate: V2V3BasicTestCaseTemplate(
                        templateId: "templateId",
                        name: "name",
                        description: V2V3TestCaseImplementationDescription(
                            boards: [
                                V2V3TestCaseImplementationDescriptionBoard.html(
                                    .init(
                                        value: Optional("value"),
                                        additionalProperties: [
                                            "type": JSONValue.string("html")
                                        ]
                                    )
                                ),
                                V2V3TestCaseImplementationDescriptionBoard.html(
                                    .init(
                                        value: Optional("value"),
                                        additionalProperties: [
                                            "type": JSONValue.string("html")
                                        ]
                                    )
                                )
                            ]
                        ),
                        expectedValueParameterId: "expectedValueParameterId"
                    )
                )
            ),
            generatedFiles: V2V3GeneratedFiles(
                generatedTestCaseFiles: [
                    "generatedTestCaseFiles": V2V3Files(
                        files: [
                            V2V3FileInfoV2(
                                filename: "filename",
                                directory: "directory",
                                contents: "contents",
                                editable: true
                            ),
                            V2V3FileInfoV2(
                                filename: "filename",
                                directory: "directory",
                                contents: "contents",
                                editable: true
                            )
                        ]
                    )
                ],
                generatedTemplateFiles: [
                    "generatedTemplateFiles": V2V3Files(
                        files: [
                            V2V3FileInfoV2(
                                filename: "filename",
                                directory: "directory",
                                contents: "contents",
                                editable: true
                            ),
                            V2V3FileInfoV2(
                                filename: "filename",
                                directory: "directory",
                                contents: "contents",
                                editable: true
                            )
                        ]
                    )
                ],
                other: [
                    "other": V2V3Files(
                        files: [
                            V2V3FileInfoV2(
                                filename: "filename",
                                directory: "directory",
                                contents: "contents",
                                editable: true
                            ),
                            V2V3FileInfoV2(
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
                V2V3TestCaseTemplate(
                    templateId: "templateId",
                    name: "name",
                    implementation: V2V3TestCaseImplementation(
                        description: V2V3TestCaseImplementationDescription(
                            boards: [
                                V2V3TestCaseImplementationDescriptionBoard.html(
                                    .init(
                                        value: Optional("value"),
                                        additionalProperties: [
                                            "type": JSONValue.string("html")
                                        ]
                                    )
                                ),
                                V2V3TestCaseImplementationDescriptionBoard.html(
                                    .init(
                                        value: Optional("value"),
                                        additionalProperties: [
                                            "type": JSONValue.string("html")
                                        ]
                                    )
                                )
                            ]
                        ),
                        function: V2V3TestCaseFunction.v2V3TestCaseFunctionZero(
                            V2V3TestCaseFunctionZero(
                                type: .withActualResult,
                                getActualResult: V2V3NonVoidFunctionDefinition(
                                    signature: V2V3NonVoidFunctionSignature(
                                        parameters: [],
                                        returnType: VariableType.variableTypeZero(
                                            VariableTypeZero(
                                                type: .integerType
                                            )
                                        )
                                    ),
                                    code: V2V3FunctionImplementationForMultipleLanguages(
                                        codeByLanguage: [
                                            "codeByLanguage": V2V3FunctionImplementation(
                                                impl: "impl"
                                            )
                                        ]
                                    )
                                ),
                                assertCorrectnessCheck: V2V3AssertCorrectnessCheck.v2V3AssertCorrectnessCheckZero(
                                    V2V3AssertCorrectnessCheckZero(
                                        type: .deepEquality,
                                        expectedValueParameterId: "expectedValueParameterId"
                                    )
                                )
                            )
                        )
                    )
                ),
                V2V3TestCaseTemplate(
                    templateId: "templateId",
                    name: "name",
                    implementation: V2V3TestCaseImplementation(
                        description: V2V3TestCaseImplementationDescription(
                            boards: [
                                V2V3TestCaseImplementationDescriptionBoard.html(
                                    .init(
                                        value: Optional("value"),
                                        additionalProperties: [
                                            "type": JSONValue.string("html")
                                        ]
                                    )
                                ),
                                V2V3TestCaseImplementationDescriptionBoard.html(
                                    .init(
                                        value: Optional("value"),
                                        additionalProperties: [
                                            "type": JSONValue.string("html")
                                        ]
                                    )
                                )
                            ]
                        ),
                        function: V2V3TestCaseFunction.v2V3TestCaseFunctionZero(
                            V2V3TestCaseFunctionZero(
                                type: .withActualResult,
                                getActualResult: V2V3NonVoidFunctionDefinition(
                                    signature: V2V3NonVoidFunctionSignature(
                                        parameters: [],
                                        returnType: VariableType.variableTypeZero(
                                            VariableTypeZero(
                                                type: .integerType
                                            )
                                        )
                                    ),
                                    code: V2V3FunctionImplementationForMultipleLanguages(
                                        codeByLanguage: [
                                            "codeByLanguage": V2V3FunctionImplementation(
                                                impl: "impl"
                                            )
                                        ]
                                    )
                                ),
                                assertCorrectnessCheck: V2V3AssertCorrectnessCheck.v2V3AssertCorrectnessCheckZero(
                                    V2V3AssertCorrectnessCheckZero(
                                        type: .deepEquality,
                                        expectedValueParameterId: "expectedValueParameterId"
                                    )
                                )
                            )
                        )
                    )
                )
            ],
            testcases: [
                V2V3TestCaseV2(
                    metadata: V2V3TestCaseMetadata(
                        id: "id",
                        name: "name",
                        hidden: true
                    ),
                    implementation: V2V3TestCaseImplementationReference.v2V3TestCaseImplementationReferenceType(
                        V2V3TestCaseImplementationReferenceType(
                            type: .templateId,
                            value: Optional("value")
                        )
                    ),
                    arguments: [
                        "arguments": VariableValue.variableValueZero(
                            VariableValueZero(
                                type: .integerValue,
                                value: Optional(1)
                            )
                        )
                    ],
                    expects: Optional(V2V3TestCaseExpects(
                        expectedStdout: Optional(Nullable<String>.value("expectedStdout"))
                    ))
                ),
                V2V3TestCaseV2(
                    metadata: V2V3TestCaseMetadata(
                        id: "id",
                        name: "name",
                        hidden: true
                    ),
                    implementation: V2V3TestCaseImplementationReference.v2V3TestCaseImplementationReferenceType(
                        V2V3TestCaseImplementationReferenceType(
                            type: .templateId,
                            value: Optional("value")
                        )
                    ),
                    arguments: [
                        "arguments": VariableValue.variableValueZero(
                            VariableValueZero(
                                type: .integerValue,
                                value: Optional(1)
                            )
                        )
                    ],
                    expects: Optional(V2V3TestCaseExpects(
                        expectedStdout: Optional(Nullable<String>.value("expectedStdout"))
                    ))
                )
            ],
            isPublic: true
        )
        let response = try await client.v2V3Problem.v2V3ProblemGetProblemVersion(
            problemId: "problemId",
            problemVersion: 1,
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}