import Foundation
import Testing
import Api

@Suite("V2ProblemClient Wire Tests") struct V2ProblemClientWireTests {
    @Test func v2ProblemGetLightweightProblems1() async throws -> Void {
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
            V2LightweightProblemInfoV2(
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
        let response = try await client.v2Problem.v2ProblemGetLightweightProblems(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func v2ProblemGetLightweightProblems2() async throws -> Void {
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
            V2LightweightProblemInfoV2(
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
            V2LightweightProblemInfoV2(
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
        let response = try await client.v2Problem.v2ProblemGetLightweightProblems(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func v2ProblemGetProblems1() async throws -> Void {
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
            V2ProblemInfoV2(
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
                customFiles: V2CustomFiles.v2CustomFilesZero(
                    V2CustomFilesZero(
                        methodName: "methodName",
                        signature: V2NonVoidFunctionSignature(
                            parameters: [
                                V2Parameter(
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
                            "key": V2Files(
                                files: [
                                    V2FileInfoV2(
                                        filename: "filename",
                                        directory: "directory",
                                        contents: "contents",
                                        editable: true
                                    )
                                ]
                            )
                        ],
                        basicTestCaseTemplate: V2BasicTestCaseTemplate(
                            templateId: "templateId",
                            name: "name",
                            description: V2TestCaseImplementationDescription(
                                boards: [
                                    V2TestCaseImplementationDescriptionBoard.html(
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
                generatedFiles: V2GeneratedFiles(
                    generatedTestCaseFiles: [
                        "key": V2Files(
                            files: [
                                V2FileInfoV2(
                                    filename: "filename",
                                    directory: "directory",
                                    contents: "contents",
                                    editable: true
                                )
                            ]
                        )
                    ],
                    generatedTemplateFiles: [
                        "key": V2Files(
                            files: [
                                V2FileInfoV2(
                                    filename: "filename",
                                    directory: "directory",
                                    contents: "contents",
                                    editable: true
                                )
                            ]
                        )
                    ],
                    other: [
                        "key": V2Files(
                            files: [
                                V2FileInfoV2(
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
                    V2TestCaseTemplate(
                        templateId: "templateId",
                        name: "name",
                        implementation: V2TestCaseImplementation(
                            description: V2TestCaseImplementationDescription(
                                boards: [
                                    V2TestCaseImplementationDescriptionBoard.html(
                                        .init(
                                            additionalProperties: [
                                                "type": JSONValue.string("html")
                                            ]
                                        )
                                    )
                                ]
                            ),
                            function: V2TestCaseFunction.v2TestCaseFunctionZero(
                                V2TestCaseFunctionZero(
                                    getActualResult: V2NonVoidFunctionDefinition(
                                        signature: V2NonVoidFunctionSignature(
                                            parameters: [
                                                V2Parameter(
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
                                        code: V2FunctionImplementationForMultipleLanguages(
                                            codeByLanguage: [
                                                "key": V2FunctionImplementation(
                                                    impl: "impl"
                                                )
                                            ]
                                        )
                                    ),
                                    assertCorrectnessCheck: V2AssertCorrectnessCheck.v2AssertCorrectnessCheckZero(
                                        V2AssertCorrectnessCheckZero(
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
                    V2TestCaseV2(
                        metadata: V2TestCaseMetadata(
                            id: "id",
                            name: "name",
                            hidden: true
                        ),
                        implementation: V2TestCaseImplementationReference.v2TestCaseImplementationReferenceType(
                            V2TestCaseImplementationReferenceType(
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
        let response = try await client.v2Problem.v2ProblemGetProblems(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func v2ProblemGetProblems2() async throws -> Void {
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
            V2ProblemInfoV2(
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
                customFiles: V2CustomFiles.v2CustomFilesZero(
                    V2CustomFilesZero(
                        type: .basic,
                        methodName: "methodName",
                        signature: V2NonVoidFunctionSignature(
                            parameters: [
                                V2Parameter(
                                    parameterId: "parameterId",
                                    name: "name",
                                    variableType: VariableType.variableTypeZero(
                                        VariableTypeZero(
                                            type: .integerType
                                        )
                                    )
                                ),
                                V2Parameter(
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
                            "additionalFiles": V2Files(
                                files: [
                                    V2FileInfoV2(
                                        filename: "filename",
                                        directory: "directory",
                                        contents: "contents",
                                        editable: true
                                    ),
                                    V2FileInfoV2(
                                        filename: "filename",
                                        directory: "directory",
                                        contents: "contents",
                                        editable: true
                                    )
                                ]
                            )
                        ],
                        basicTestCaseTemplate: V2BasicTestCaseTemplate(
                            templateId: "templateId",
                            name: "name",
                            description: V2TestCaseImplementationDescription(
                                boards: [
                                    V2TestCaseImplementationDescriptionBoard.html(
                                        .init(
                                            value: Optional("value"),
                                            additionalProperties: [
                                                "type": JSONValue.string("html")
                                            ]
                                        )
                                    ),
                                    V2TestCaseImplementationDescriptionBoard.html(
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
                generatedFiles: V2GeneratedFiles(
                    generatedTestCaseFiles: [
                        "generatedTestCaseFiles": V2Files(
                            files: [
                                V2FileInfoV2(
                                    filename: "filename",
                                    directory: "directory",
                                    contents: "contents",
                                    editable: true
                                ),
                                V2FileInfoV2(
                                    filename: "filename",
                                    directory: "directory",
                                    contents: "contents",
                                    editable: true
                                )
                            ]
                        )
                    ],
                    generatedTemplateFiles: [
                        "generatedTemplateFiles": V2Files(
                            files: [
                                V2FileInfoV2(
                                    filename: "filename",
                                    directory: "directory",
                                    contents: "contents",
                                    editable: true
                                ),
                                V2FileInfoV2(
                                    filename: "filename",
                                    directory: "directory",
                                    contents: "contents",
                                    editable: true
                                )
                            ]
                        )
                    ],
                    other: [
                        "other": V2Files(
                            files: [
                                V2FileInfoV2(
                                    filename: "filename",
                                    directory: "directory",
                                    contents: "contents",
                                    editable: true
                                ),
                                V2FileInfoV2(
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
                    V2TestCaseTemplate(
                        templateId: "templateId",
                        name: "name",
                        implementation: V2TestCaseImplementation(
                            description: V2TestCaseImplementationDescription(
                                boards: [
                                    V2TestCaseImplementationDescriptionBoard.html(
                                        .init(
                                            value: Optional("value"),
                                            additionalProperties: [
                                                "type": JSONValue.string("html")
                                            ]
                                        )
                                    ),
                                    V2TestCaseImplementationDescriptionBoard.html(
                                        .init(
                                            value: Optional("value"),
                                            additionalProperties: [
                                                "type": JSONValue.string("html")
                                            ]
                                        )
                                    )
                                ]
                            ),
                            function: V2TestCaseFunction.v2TestCaseFunctionOne(
                                V2TestCaseFunctionOne(
                                    type: .custom,
                                    parameters: [],
                                    code: V2FunctionImplementationForMultipleLanguages(
                                        codeByLanguage: [
                                            "codeByLanguage": V2FunctionImplementation(
                                                impl: "impl"
                                            )
                                        ]
                                    )
                                )
                            )
                        )
                    ),
                    V2TestCaseTemplate(
                        templateId: "templateId",
                        name: "name",
                        implementation: V2TestCaseImplementation(
                            description: V2TestCaseImplementationDescription(
                                boards: [
                                    V2TestCaseImplementationDescriptionBoard.html(
                                        .init(
                                            value: Optional("value"),
                                            additionalProperties: [
                                                "type": JSONValue.string("html")
                                            ]
                                        )
                                    ),
                                    V2TestCaseImplementationDescriptionBoard.html(
                                        .init(
                                            value: Optional("value"),
                                            additionalProperties: [
                                                "type": JSONValue.string("html")
                                            ]
                                        )
                                    )
                                ]
                            ),
                            function: V2TestCaseFunction.v2TestCaseFunctionOne(
                                V2TestCaseFunctionOne(
                                    type: .custom,
                                    parameters: [],
                                    code: V2FunctionImplementationForMultipleLanguages(
                                        codeByLanguage: [
                                            "codeByLanguage": V2FunctionImplementation(
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
                    V2TestCaseV2(
                        metadata: V2TestCaseMetadata(
                            id: "id",
                            name: "name",
                            hidden: true
                        ),
                        implementation: V2TestCaseImplementationReference.v2TestCaseImplementationReferenceType(
                            V2TestCaseImplementationReferenceType(
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
                        expects: Optional(V2TestCaseExpects(
                            expectedStdout: Optional(Nullable<String>.value("expectedStdout"))
                        ))
                    ),
                    V2TestCaseV2(
                        metadata: V2TestCaseMetadata(
                            id: "id",
                            name: "name",
                            hidden: true
                        ),
                        implementation: V2TestCaseImplementationReference.v2TestCaseImplementationReferenceType(
                            V2TestCaseImplementationReferenceType(
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
                        expects: Optional(V2TestCaseExpects(
                            expectedStdout: Optional(Nullable<String>.value("expectedStdout"))
                        ))
                    )
                ],
                isPublic: true
            ),
            V2ProblemInfoV2(
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
                customFiles: V2CustomFiles.v2CustomFilesZero(
                    V2CustomFilesZero(
                        type: .basic,
                        methodName: "methodName",
                        signature: V2NonVoidFunctionSignature(
                            parameters: [
                                V2Parameter(
                                    parameterId: "parameterId",
                                    name: "name",
                                    variableType: VariableType.variableTypeZero(
                                        VariableTypeZero(
                                            type: .integerType
                                        )
                                    )
                                ),
                                V2Parameter(
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
                            "additionalFiles": V2Files(
                                files: [
                                    V2FileInfoV2(
                                        filename: "filename",
                                        directory: "directory",
                                        contents: "contents",
                                        editable: true
                                    ),
                                    V2FileInfoV2(
                                        filename: "filename",
                                        directory: "directory",
                                        contents: "contents",
                                        editable: true
                                    )
                                ]
                            )
                        ],
                        basicTestCaseTemplate: V2BasicTestCaseTemplate(
                            templateId: "templateId",
                            name: "name",
                            description: V2TestCaseImplementationDescription(
                                boards: [
                                    V2TestCaseImplementationDescriptionBoard.html(
                                        .init(
                                            value: Optional("value"),
                                            additionalProperties: [
                                                "type": JSONValue.string("html")
                                            ]
                                        )
                                    ),
                                    V2TestCaseImplementationDescriptionBoard.html(
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
                generatedFiles: V2GeneratedFiles(
                    generatedTestCaseFiles: [
                        "generatedTestCaseFiles": V2Files(
                            files: [
                                V2FileInfoV2(
                                    filename: "filename",
                                    directory: "directory",
                                    contents: "contents",
                                    editable: true
                                ),
                                V2FileInfoV2(
                                    filename: "filename",
                                    directory: "directory",
                                    contents: "contents",
                                    editable: true
                                )
                            ]
                        )
                    ],
                    generatedTemplateFiles: [
                        "generatedTemplateFiles": V2Files(
                            files: [
                                V2FileInfoV2(
                                    filename: "filename",
                                    directory: "directory",
                                    contents: "contents",
                                    editable: true
                                ),
                                V2FileInfoV2(
                                    filename: "filename",
                                    directory: "directory",
                                    contents: "contents",
                                    editable: true
                                )
                            ]
                        )
                    ],
                    other: [
                        "other": V2Files(
                            files: [
                                V2FileInfoV2(
                                    filename: "filename",
                                    directory: "directory",
                                    contents: "contents",
                                    editable: true
                                ),
                                V2FileInfoV2(
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
                    V2TestCaseTemplate(
                        templateId: "templateId",
                        name: "name",
                        implementation: V2TestCaseImplementation(
                            description: V2TestCaseImplementationDescription(
                                boards: [
                                    V2TestCaseImplementationDescriptionBoard.html(
                                        .init(
                                            value: Optional("value"),
                                            additionalProperties: [
                                                "type": JSONValue.string("html")
                                            ]
                                        )
                                    ),
                                    V2TestCaseImplementationDescriptionBoard.html(
                                        .init(
                                            value: Optional("value"),
                                            additionalProperties: [
                                                "type": JSONValue.string("html")
                                            ]
                                        )
                                    )
                                ]
                            ),
                            function: V2TestCaseFunction.v2TestCaseFunctionOne(
                                V2TestCaseFunctionOne(
                                    type: .custom,
                                    parameters: [],
                                    code: V2FunctionImplementationForMultipleLanguages(
                                        codeByLanguage: [
                                            "codeByLanguage": V2FunctionImplementation(
                                                impl: "impl"
                                            )
                                        ]
                                    )
                                )
                            )
                        )
                    ),
                    V2TestCaseTemplate(
                        templateId: "templateId",
                        name: "name",
                        implementation: V2TestCaseImplementation(
                            description: V2TestCaseImplementationDescription(
                                boards: [
                                    V2TestCaseImplementationDescriptionBoard.html(
                                        .init(
                                            value: Optional("value"),
                                            additionalProperties: [
                                                "type": JSONValue.string("html")
                                            ]
                                        )
                                    ),
                                    V2TestCaseImplementationDescriptionBoard.html(
                                        .init(
                                            value: Optional("value"),
                                            additionalProperties: [
                                                "type": JSONValue.string("html")
                                            ]
                                        )
                                    )
                                ]
                            ),
                            function: V2TestCaseFunction.v2TestCaseFunctionOne(
                                V2TestCaseFunctionOne(
                                    type: .custom,
                                    parameters: [],
                                    code: V2FunctionImplementationForMultipleLanguages(
                                        codeByLanguage: [
                                            "codeByLanguage": V2FunctionImplementation(
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
                    V2TestCaseV2(
                        metadata: V2TestCaseMetadata(
                            id: "id",
                            name: "name",
                            hidden: true
                        ),
                        implementation: V2TestCaseImplementationReference.v2TestCaseImplementationReferenceType(
                            V2TestCaseImplementationReferenceType(
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
                        expects: Optional(V2TestCaseExpects(
                            expectedStdout: Optional(Nullable<String>.value("expectedStdout"))
                        ))
                    ),
                    V2TestCaseV2(
                        metadata: V2TestCaseMetadata(
                            id: "id",
                            name: "name",
                            hidden: true
                        ),
                        implementation: V2TestCaseImplementationReference.v2TestCaseImplementationReferenceType(
                            V2TestCaseImplementationReferenceType(
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
                        expects: Optional(V2TestCaseExpects(
                            expectedStdout: Optional(Nullable<String>.value("expectedStdout"))
                        ))
                    )
                ],
                isPublic: true
            )
        ]
        let response = try await client.v2Problem.v2ProblemGetProblems(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func v2ProblemGetLatestProblem1() async throws -> Void {
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
        let expectedResponse = V2ProblemInfoV2(
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
            customFiles: V2CustomFiles.v2CustomFilesZero(
                V2CustomFilesZero(
                    methodName: "methodName",
                    signature: V2NonVoidFunctionSignature(
                        parameters: [
                            V2Parameter(
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
                        "key": V2Files(
                            files: [
                                V2FileInfoV2(
                                    filename: "filename",
                                    directory: "directory",
                                    contents: "contents",
                                    editable: true
                                )
                            ]
                        )
                    ],
                    basicTestCaseTemplate: V2BasicTestCaseTemplate(
                        templateId: "templateId",
                        name: "name",
                        description: V2TestCaseImplementationDescription(
                            boards: [
                                V2TestCaseImplementationDescriptionBoard.html(
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
            generatedFiles: V2GeneratedFiles(
                generatedTestCaseFiles: [
                    "key": V2Files(
                        files: [
                            V2FileInfoV2(
                                filename: "filename",
                                directory: "directory",
                                contents: "contents",
                                editable: true
                            )
                        ]
                    )
                ],
                generatedTemplateFiles: [
                    "key": V2Files(
                        files: [
                            V2FileInfoV2(
                                filename: "filename",
                                directory: "directory",
                                contents: "contents",
                                editable: true
                            )
                        ]
                    )
                ],
                other: [
                    "key": V2Files(
                        files: [
                            V2FileInfoV2(
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
                V2TestCaseTemplate(
                    templateId: "templateId",
                    name: "name",
                    implementation: V2TestCaseImplementation(
                        description: V2TestCaseImplementationDescription(
                            boards: [
                                V2TestCaseImplementationDescriptionBoard.html(
                                    .init(
                                        additionalProperties: [
                                            "type": JSONValue.string("html")
                                        ]
                                    )
                                )
                            ]
                        ),
                        function: V2TestCaseFunction.v2TestCaseFunctionZero(
                            V2TestCaseFunctionZero(
                                getActualResult: V2NonVoidFunctionDefinition(
                                    signature: V2NonVoidFunctionSignature(
                                        parameters: [
                                            V2Parameter(
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
                                    code: V2FunctionImplementationForMultipleLanguages(
                                        codeByLanguage: [
                                            "key": V2FunctionImplementation(
                                                impl: "impl"
                                            )
                                        ]
                                    )
                                ),
                                assertCorrectnessCheck: V2AssertCorrectnessCheck.v2AssertCorrectnessCheckZero(
                                    V2AssertCorrectnessCheckZero(
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
                V2TestCaseV2(
                    metadata: V2TestCaseMetadata(
                        id: "id",
                        name: "name",
                        hidden: true
                    ),
                    implementation: V2TestCaseImplementationReference.v2TestCaseImplementationReferenceType(
                        V2TestCaseImplementationReferenceType(
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
        let response = try await client.v2Problem.v2ProblemGetLatestProblem(
            problemId: "problemId",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func v2ProblemGetLatestProblem2() async throws -> Void {
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
        let expectedResponse = V2ProblemInfoV2(
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
            customFiles: V2CustomFiles.v2CustomFilesZero(
                V2CustomFilesZero(
                    type: .basic,
                    methodName: "methodName",
                    signature: V2NonVoidFunctionSignature(
                        parameters: [
                            V2Parameter(
                                parameterId: "parameterId",
                                name: "name",
                                variableType: VariableType.variableTypeZero(
                                    VariableTypeZero(
                                        type: .integerType
                                    )
                                )
                            ),
                            V2Parameter(
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
                        "additionalFiles": V2Files(
                            files: [
                                V2FileInfoV2(
                                    filename: "filename",
                                    directory: "directory",
                                    contents: "contents",
                                    editable: true
                                ),
                                V2FileInfoV2(
                                    filename: "filename",
                                    directory: "directory",
                                    contents: "contents",
                                    editable: true
                                )
                            ]
                        )
                    ],
                    basicTestCaseTemplate: V2BasicTestCaseTemplate(
                        templateId: "templateId",
                        name: "name",
                        description: V2TestCaseImplementationDescription(
                            boards: [
                                V2TestCaseImplementationDescriptionBoard.html(
                                    .init(
                                        value: Optional("value"),
                                        additionalProperties: [
                                            "type": JSONValue.string("html")
                                        ]
                                    )
                                ),
                                V2TestCaseImplementationDescriptionBoard.html(
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
            generatedFiles: V2GeneratedFiles(
                generatedTestCaseFiles: [
                    "generatedTestCaseFiles": V2Files(
                        files: [
                            V2FileInfoV2(
                                filename: "filename",
                                directory: "directory",
                                contents: "contents",
                                editable: true
                            ),
                            V2FileInfoV2(
                                filename: "filename",
                                directory: "directory",
                                contents: "contents",
                                editable: true
                            )
                        ]
                    )
                ],
                generatedTemplateFiles: [
                    "generatedTemplateFiles": V2Files(
                        files: [
                            V2FileInfoV2(
                                filename: "filename",
                                directory: "directory",
                                contents: "contents",
                                editable: true
                            ),
                            V2FileInfoV2(
                                filename: "filename",
                                directory: "directory",
                                contents: "contents",
                                editable: true
                            )
                        ]
                    )
                ],
                other: [
                    "other": V2Files(
                        files: [
                            V2FileInfoV2(
                                filename: "filename",
                                directory: "directory",
                                contents: "contents",
                                editable: true
                            ),
                            V2FileInfoV2(
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
                V2TestCaseTemplate(
                    templateId: "templateId",
                    name: "name",
                    implementation: V2TestCaseImplementation(
                        description: V2TestCaseImplementationDescription(
                            boards: [
                                V2TestCaseImplementationDescriptionBoard.html(
                                    .init(
                                        value: Optional("value"),
                                        additionalProperties: [
                                            "type": JSONValue.string("html")
                                        ]
                                    )
                                ),
                                V2TestCaseImplementationDescriptionBoard.html(
                                    .init(
                                        value: Optional("value"),
                                        additionalProperties: [
                                            "type": JSONValue.string("html")
                                        ]
                                    )
                                )
                            ]
                        ),
                        function: V2TestCaseFunction.v2TestCaseFunctionZero(
                            V2TestCaseFunctionZero(
                                type: .withActualResult,
                                getActualResult: V2NonVoidFunctionDefinition(
                                    signature: V2NonVoidFunctionSignature(
                                        parameters: [],
                                        returnType: VariableType.variableTypeZero(
                                            VariableTypeZero(
                                                type: .integerType
                                            )
                                        )
                                    ),
                                    code: V2FunctionImplementationForMultipleLanguages(
                                        codeByLanguage: [
                                            "codeByLanguage": V2FunctionImplementation(
                                                impl: "impl"
                                            )
                                        ]
                                    )
                                ),
                                assertCorrectnessCheck: V2AssertCorrectnessCheck.v2AssertCorrectnessCheckZero(
                                    V2AssertCorrectnessCheckZero(
                                        type: .deepEquality,
                                        expectedValueParameterId: "expectedValueParameterId"
                                    )
                                )
                            )
                        )
                    )
                ),
                V2TestCaseTemplate(
                    templateId: "templateId",
                    name: "name",
                    implementation: V2TestCaseImplementation(
                        description: V2TestCaseImplementationDescription(
                            boards: [
                                V2TestCaseImplementationDescriptionBoard.html(
                                    .init(
                                        value: Optional("value"),
                                        additionalProperties: [
                                            "type": JSONValue.string("html")
                                        ]
                                    )
                                ),
                                V2TestCaseImplementationDescriptionBoard.html(
                                    .init(
                                        value: Optional("value"),
                                        additionalProperties: [
                                            "type": JSONValue.string("html")
                                        ]
                                    )
                                )
                            ]
                        ),
                        function: V2TestCaseFunction.v2TestCaseFunctionZero(
                            V2TestCaseFunctionZero(
                                type: .withActualResult,
                                getActualResult: V2NonVoidFunctionDefinition(
                                    signature: V2NonVoidFunctionSignature(
                                        parameters: [],
                                        returnType: VariableType.variableTypeZero(
                                            VariableTypeZero(
                                                type: .integerType
                                            )
                                        )
                                    ),
                                    code: V2FunctionImplementationForMultipleLanguages(
                                        codeByLanguage: [
                                            "codeByLanguage": V2FunctionImplementation(
                                                impl: "impl"
                                            )
                                        ]
                                    )
                                ),
                                assertCorrectnessCheck: V2AssertCorrectnessCheck.v2AssertCorrectnessCheckZero(
                                    V2AssertCorrectnessCheckZero(
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
                V2TestCaseV2(
                    metadata: V2TestCaseMetadata(
                        id: "id",
                        name: "name",
                        hidden: true
                    ),
                    implementation: V2TestCaseImplementationReference.v2TestCaseImplementationReferenceType(
                        V2TestCaseImplementationReferenceType(
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
                    expects: Optional(V2TestCaseExpects(
                        expectedStdout: Optional(Nullable<String>.value("expectedStdout"))
                    ))
                ),
                V2TestCaseV2(
                    metadata: V2TestCaseMetadata(
                        id: "id",
                        name: "name",
                        hidden: true
                    ),
                    implementation: V2TestCaseImplementationReference.v2TestCaseImplementationReferenceType(
                        V2TestCaseImplementationReferenceType(
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
                    expects: Optional(V2TestCaseExpects(
                        expectedStdout: Optional(Nullable<String>.value("expectedStdout"))
                    ))
                )
            ],
            isPublic: true
        )
        let response = try await client.v2Problem.v2ProblemGetLatestProblem(
            problemId: "problemId",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func v2ProblemGetProblemVersion1() async throws -> Void {
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
        let expectedResponse = V2ProblemInfoV2(
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
            customFiles: V2CustomFiles.v2CustomFilesZero(
                V2CustomFilesZero(
                    methodName: "methodName",
                    signature: V2NonVoidFunctionSignature(
                        parameters: [
                            V2Parameter(
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
                        "key": V2Files(
                            files: [
                                V2FileInfoV2(
                                    filename: "filename",
                                    directory: "directory",
                                    contents: "contents",
                                    editable: true
                                )
                            ]
                        )
                    ],
                    basicTestCaseTemplate: V2BasicTestCaseTemplate(
                        templateId: "templateId",
                        name: "name",
                        description: V2TestCaseImplementationDescription(
                            boards: [
                                V2TestCaseImplementationDescriptionBoard.html(
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
            generatedFiles: V2GeneratedFiles(
                generatedTestCaseFiles: [
                    "key": V2Files(
                        files: [
                            V2FileInfoV2(
                                filename: "filename",
                                directory: "directory",
                                contents: "contents",
                                editable: true
                            )
                        ]
                    )
                ],
                generatedTemplateFiles: [
                    "key": V2Files(
                        files: [
                            V2FileInfoV2(
                                filename: "filename",
                                directory: "directory",
                                contents: "contents",
                                editable: true
                            )
                        ]
                    )
                ],
                other: [
                    "key": V2Files(
                        files: [
                            V2FileInfoV2(
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
                V2TestCaseTemplate(
                    templateId: "templateId",
                    name: "name",
                    implementation: V2TestCaseImplementation(
                        description: V2TestCaseImplementationDescription(
                            boards: [
                                V2TestCaseImplementationDescriptionBoard.html(
                                    .init(
                                        additionalProperties: [
                                            "type": JSONValue.string("html")
                                        ]
                                    )
                                )
                            ]
                        ),
                        function: V2TestCaseFunction.v2TestCaseFunctionZero(
                            V2TestCaseFunctionZero(
                                getActualResult: V2NonVoidFunctionDefinition(
                                    signature: V2NonVoidFunctionSignature(
                                        parameters: [
                                            V2Parameter(
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
                                    code: V2FunctionImplementationForMultipleLanguages(
                                        codeByLanguage: [
                                            "key": V2FunctionImplementation(
                                                impl: "impl"
                                            )
                                        ]
                                    )
                                ),
                                assertCorrectnessCheck: V2AssertCorrectnessCheck.v2AssertCorrectnessCheckZero(
                                    V2AssertCorrectnessCheckZero(
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
                V2TestCaseV2(
                    metadata: V2TestCaseMetadata(
                        id: "id",
                        name: "name",
                        hidden: true
                    ),
                    implementation: V2TestCaseImplementationReference.v2TestCaseImplementationReferenceType(
                        V2TestCaseImplementationReferenceType(
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
        let response = try await client.v2Problem.v2ProblemGetProblemVersion(
            problemId: "problemId",
            problemVersion: 1,
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func v2ProblemGetProblemVersion2() async throws -> Void {
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
        let expectedResponse = V2ProblemInfoV2(
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
            customFiles: V2CustomFiles.v2CustomFilesZero(
                V2CustomFilesZero(
                    type: .basic,
                    methodName: "methodName",
                    signature: V2NonVoidFunctionSignature(
                        parameters: [
                            V2Parameter(
                                parameterId: "parameterId",
                                name: "name",
                                variableType: VariableType.variableTypeZero(
                                    VariableTypeZero(
                                        type: .integerType
                                    )
                                )
                            ),
                            V2Parameter(
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
                        "additionalFiles": V2Files(
                            files: [
                                V2FileInfoV2(
                                    filename: "filename",
                                    directory: "directory",
                                    contents: "contents",
                                    editable: true
                                ),
                                V2FileInfoV2(
                                    filename: "filename",
                                    directory: "directory",
                                    contents: "contents",
                                    editable: true
                                )
                            ]
                        )
                    ],
                    basicTestCaseTemplate: V2BasicTestCaseTemplate(
                        templateId: "templateId",
                        name: "name",
                        description: V2TestCaseImplementationDescription(
                            boards: [
                                V2TestCaseImplementationDescriptionBoard.html(
                                    .init(
                                        value: Optional("value"),
                                        additionalProperties: [
                                            "type": JSONValue.string("html")
                                        ]
                                    )
                                ),
                                V2TestCaseImplementationDescriptionBoard.html(
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
            generatedFiles: V2GeneratedFiles(
                generatedTestCaseFiles: [
                    "generatedTestCaseFiles": V2Files(
                        files: [
                            V2FileInfoV2(
                                filename: "filename",
                                directory: "directory",
                                contents: "contents",
                                editable: true
                            ),
                            V2FileInfoV2(
                                filename: "filename",
                                directory: "directory",
                                contents: "contents",
                                editable: true
                            )
                        ]
                    )
                ],
                generatedTemplateFiles: [
                    "generatedTemplateFiles": V2Files(
                        files: [
                            V2FileInfoV2(
                                filename: "filename",
                                directory: "directory",
                                contents: "contents",
                                editable: true
                            ),
                            V2FileInfoV2(
                                filename: "filename",
                                directory: "directory",
                                contents: "contents",
                                editable: true
                            )
                        ]
                    )
                ],
                other: [
                    "other": V2Files(
                        files: [
                            V2FileInfoV2(
                                filename: "filename",
                                directory: "directory",
                                contents: "contents",
                                editable: true
                            ),
                            V2FileInfoV2(
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
                V2TestCaseTemplate(
                    templateId: "templateId",
                    name: "name",
                    implementation: V2TestCaseImplementation(
                        description: V2TestCaseImplementationDescription(
                            boards: [
                                V2TestCaseImplementationDescriptionBoard.html(
                                    .init(
                                        value: Optional("value"),
                                        additionalProperties: [
                                            "type": JSONValue.string("html")
                                        ]
                                    )
                                ),
                                V2TestCaseImplementationDescriptionBoard.html(
                                    .init(
                                        value: Optional("value"),
                                        additionalProperties: [
                                            "type": JSONValue.string("html")
                                        ]
                                    )
                                )
                            ]
                        ),
                        function: V2TestCaseFunction.v2TestCaseFunctionZero(
                            V2TestCaseFunctionZero(
                                type: .withActualResult,
                                getActualResult: V2NonVoidFunctionDefinition(
                                    signature: V2NonVoidFunctionSignature(
                                        parameters: [],
                                        returnType: VariableType.variableTypeZero(
                                            VariableTypeZero(
                                                type: .integerType
                                            )
                                        )
                                    ),
                                    code: V2FunctionImplementationForMultipleLanguages(
                                        codeByLanguage: [
                                            "codeByLanguage": V2FunctionImplementation(
                                                impl: "impl"
                                            )
                                        ]
                                    )
                                ),
                                assertCorrectnessCheck: V2AssertCorrectnessCheck.v2AssertCorrectnessCheckZero(
                                    V2AssertCorrectnessCheckZero(
                                        type: .deepEquality,
                                        expectedValueParameterId: "expectedValueParameterId"
                                    )
                                )
                            )
                        )
                    )
                ),
                V2TestCaseTemplate(
                    templateId: "templateId",
                    name: "name",
                    implementation: V2TestCaseImplementation(
                        description: V2TestCaseImplementationDescription(
                            boards: [
                                V2TestCaseImplementationDescriptionBoard.html(
                                    .init(
                                        value: Optional("value"),
                                        additionalProperties: [
                                            "type": JSONValue.string("html")
                                        ]
                                    )
                                ),
                                V2TestCaseImplementationDescriptionBoard.html(
                                    .init(
                                        value: Optional("value"),
                                        additionalProperties: [
                                            "type": JSONValue.string("html")
                                        ]
                                    )
                                )
                            ]
                        ),
                        function: V2TestCaseFunction.v2TestCaseFunctionZero(
                            V2TestCaseFunctionZero(
                                type: .withActualResult,
                                getActualResult: V2NonVoidFunctionDefinition(
                                    signature: V2NonVoidFunctionSignature(
                                        parameters: [],
                                        returnType: VariableType.variableTypeZero(
                                            VariableTypeZero(
                                                type: .integerType
                                            )
                                        )
                                    ),
                                    code: V2FunctionImplementationForMultipleLanguages(
                                        codeByLanguage: [
                                            "codeByLanguage": V2FunctionImplementation(
                                                impl: "impl"
                                            )
                                        ]
                                    )
                                ),
                                assertCorrectnessCheck: V2AssertCorrectnessCheck.v2AssertCorrectnessCheckZero(
                                    V2AssertCorrectnessCheckZero(
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
                V2TestCaseV2(
                    metadata: V2TestCaseMetadata(
                        id: "id",
                        name: "name",
                        hidden: true
                    ),
                    implementation: V2TestCaseImplementationReference.v2TestCaseImplementationReferenceType(
                        V2TestCaseImplementationReferenceType(
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
                    expects: Optional(V2TestCaseExpects(
                        expectedStdout: Optional(Nullable<String>.value("expectedStdout"))
                    ))
                ),
                V2TestCaseV2(
                    metadata: V2TestCaseMetadata(
                        id: "id",
                        name: "name",
                        hidden: true
                    ),
                    implementation: V2TestCaseImplementationReference.v2TestCaseImplementationReferenceType(
                        V2TestCaseImplementationReferenceType(
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
                    expects: Optional(V2TestCaseExpects(
                        expectedStdout: Optional(Nullable<String>.value("expectedStdout"))
                    ))
                )
            ],
            isPublic: true
        )
        let response = try await client.v2Problem.v2ProblemGetProblemVersion(
            problemId: "problemId",
            problemVersion: 1,
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}