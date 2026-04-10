import Foundation
import Testing
import Api

@Suite("Client Wire Tests") struct ClientWireTests {
    @Test func getAccount1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "id": "id",
                  "related_resources": [
                    {
                      "id": "id",
                      "related_resources": [],
                      "memo": {
                        "description": "description"
                      },
                      "resource_type": "Patient",
                      "name": "name",
                      "scripts": [
                        {
                          "id": "id",
                          "related_resources": [],
                          "memo": {
                            "description": "description"
                          },
                          "resource_type": "Script",
                          "name": "name"
                        }
                      ]
                    }
                  ],
                  "memo": {
                    "description": "description"
                  },
                  "resource_type": "Account",
                  "name": "name",
                  "patient": {
                    "id": "id",
                    "related_resources": [
                      {
                        "id": "id",
                        "related_resources": [],
                        "memo": {
                          "description": "description"
                        },
                        "resource_type": "Practitioner",
                        "name": "name"
                      }
                    ],
                    "memo": {
                      "description": "description"
                    },
                    "resource_type": "Patient",
                    "name": "name",
                    "scripts": [
                      {
                        "id": "id",
                        "related_resources": [
                          {
                            "id": "id",
                            "related_resources": [],
                            "memo": {
                              "description": "description"
                            },
                            "resource_type": "Practitioner",
                            "name": "name"
                          }
                        ],
                        "memo": {
                          "description": "description"
                        },
                        "resource_type": "Script",
                        "name": "name"
                      }
                    ]
                  },
                  "practitioner": {
                    "id": "id",
                    "related_resources": [
                      {
                        "id": "id",
                        "related_resources": [],
                        "memo": {
                          "description": "description"
                        },
                        "resource_type": "Patient",
                        "name": "name",
                        "scripts": [
                          {
                            "id": "id",
                            "related_resources": [],
                            "memo": {
                              "description": "description"
                            },
                            "resource_type": "Script",
                            "name": "name"
                          }
                        ]
                      }
                    ],
                    "memo": {
                      "description": "description"
                    },
                    "resource_type": "Practitioner",
                    "name": "name"
                  }
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = Account(
            id: "id",
            relatedResources: [
                ResourceList.patient(
                    .init(
                        id: "id",
                        relatedResources: [],
                        memo: Memo(
                            description: "description"
                        ),
                        resourceType: .patient,
                        name: "name",
                        scripts: [
                            Script(
                                id: "id",
                                relatedResources: [],
                                memo: Memo(
                                    description: "description"
                                ),
                                resourceType: .script,
                                name: "name"
                            )
                        ]
                    )
                )
            ],
            memo: Memo(
                description: "description"
            ),
            resourceType: .account,
            name: "name",
            patient: Optional(Patient(
                id: "id",
                relatedResources: [
                    ResourceList.practitioner(
                        .init(
                            id: "id",
                            relatedResources: [],
                            memo: Memo(
                                description: "description"
                            ),
                            resourceType: .practitioner,
                            name: "name"
                        )
                    )
                ],
                memo: Memo(
                    description: "description"
                ),
                resourceType: .patient,
                name: "name",
                scripts: [
                    Script(
                        id: "id",
                        relatedResources: [
                            ResourceList.practitioner(
                                .init(
                                    id: "id",
                                    relatedResources: [],
                                    memo: Memo(
                                        description: "description"
                                    ),
                                    resourceType: .practitioner,
                                    name: "name"
                                )
                            )
                        ],
                        memo: Memo(
                            description: "description"
                        ),
                        resourceType: .script,
                        name: "name"
                    )
                ]
            )),
            practitioner: Optional(Practitioner(
                id: "id",
                relatedResources: [
                    ResourceList.patient(
                        .init(
                            id: "id",
                            relatedResources: [],
                            memo: Memo(
                                description: "description"
                            ),
                            resourceType: .patient,
                            name: "name",
                            scripts: [
                                Script(
                                    id: "id",
                                    relatedResources: [],
                                    memo: Memo(
                                        description: "description"
                                    ),
                                    resourceType: .script,
                                    name: "name"
                                )
                            ]
                        )
                    )
                ],
                memo: Memo(
                    description: "description"
                ),
                resourceType: .practitioner,
                name: "name"
            ))
        )
        let response = try await client..getAccount(
            accountId: "account_id",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getAccount2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "resource_type": "Account",
                  "name": "name",
                  "patient": {
                    "resource_type": "Patient",
                    "name": "name",
                    "scripts": [
                      {
                        "resource_type": "Script",
                        "name": "name",
                        "id": "id",
                        "related_resources": [
                          {
                            "resource_type": "Account",
                            "name": "name",
                            "patient": {
                              "resource_type": "Patient",
                              "name": "name",
                              "scripts": [],
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description"
                              }
                            },
                            "practitioner": {
                              "resource_type": "Practitioner",
                              "name": "name",
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description"
                              }
                            },
                            "id": "id",
                            "related_resources": [
                              {
                                "resource_type": "Account",
                                "name": "name",
                                "id": "id",
                                "related_resources": [],
                                "memo": {
                                  "description": "description"
                                }
                              },
                              {
                                "resource_type": "Account",
                                "name": "name",
                                "id": "id",
                                "related_resources": [],
                                "memo": {
                                  "description": "description"
                                }
                              }
                            ],
                            "memo": {
                              "description": "description"
                            }
                          },
                          {
                            "resource_type": "Account",
                            "name": "name",
                            "patient": {
                              "resource_type": "Patient",
                              "name": "name",
                              "scripts": [],
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description"
                              }
                            },
                            "practitioner": {
                              "resource_type": "Practitioner",
                              "name": "name",
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description"
                              }
                            },
                            "id": "id",
                            "related_resources": [
                              {
                                "resource_type": "Account",
                                "name": "name",
                                "id": "id",
                                "related_resources": [],
                                "memo": {
                                  "description": "description"
                                }
                              },
                              {
                                "resource_type": "Account",
                                "name": "name",
                                "id": "id",
                                "related_resources": [],
                                "memo": {
                                  "description": "description"
                                }
                              }
                            ],
                            "memo": {
                              "description": "description"
                            }
                          }
                        ],
                        "memo": {
                          "description": "description",
                          "account": {
                            "resource_type": "Account",
                            "name": "name",
                            "id": "id",
                            "related_resources": [],
                            "memo": {
                              "description": "description",
                              "account": {
                                "resource_type": "Account",
                                "name": "name",
                                "id": "id",
                                "related_resources": [],
                                "memo": {
                                  "description": "description"
                                }
                              }
                            }
                          }
                        }
                      },
                      {
                        "resource_type": "Script",
                        "name": "name",
                        "id": "id",
                        "related_resources": [
                          {
                            "resource_type": "Account",
                            "name": "name",
                            "patient": {
                              "resource_type": "Patient",
                              "name": "name",
                              "scripts": [],
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description"
                              }
                            },
                            "practitioner": {
                              "resource_type": "Practitioner",
                              "name": "name",
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description"
                              }
                            },
                            "id": "id",
                            "related_resources": [
                              {
                                "resource_type": "Account",
                                "name": "name",
                                "id": "id",
                                "related_resources": [],
                                "memo": {
                                  "description": "description"
                                }
                              },
                              {
                                "resource_type": "Account",
                                "name": "name",
                                "id": "id",
                                "related_resources": [],
                                "memo": {
                                  "description": "description"
                                }
                              }
                            ],
                            "memo": {
                              "description": "description"
                            }
                          },
                          {
                            "resource_type": "Account",
                            "name": "name",
                            "patient": {
                              "resource_type": "Patient",
                              "name": "name",
                              "scripts": [],
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description"
                              }
                            },
                            "practitioner": {
                              "resource_type": "Practitioner",
                              "name": "name",
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description"
                              }
                            },
                            "id": "id",
                            "related_resources": [
                              {
                                "resource_type": "Account",
                                "name": "name",
                                "id": "id",
                                "related_resources": [],
                                "memo": {
                                  "description": "description"
                                }
                              },
                              {
                                "resource_type": "Account",
                                "name": "name",
                                "id": "id",
                                "related_resources": [],
                                "memo": {
                                  "description": "description"
                                }
                              }
                            ],
                            "memo": {
                              "description": "description"
                            }
                          }
                        ],
                        "memo": {
                          "description": "description",
                          "account": {
                            "resource_type": "Account",
                            "name": "name",
                            "id": "id",
                            "related_resources": [],
                            "memo": {
                              "description": "description",
                              "account": {
                                "resource_type": "Account",
                                "name": "name",
                                "id": "id",
                                "related_resources": [],
                                "memo": {
                                  "description": "description"
                                }
                              }
                            }
                          }
                        }
                      }
                    ],
                    "id": "id",
                    "related_resources": [
                      {
                        "resource_type": "Account",
                        "name": "name",
                        "patient": {
                          "resource_type": "Patient",
                          "name": "name",
                          "scripts": [
                            {
                              "resource_type": "Script",
                              "name": "name",
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description"
                              }
                            },
                            {
                              "resource_type": "Script",
                              "name": "name",
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description"
                              }
                            }
                          ],
                          "id": "id",
                          "related_resources": [
                            {
                              "resource_type": "Account",
                              "name": "name",
                              "patient": {
                                "resource_type": "Patient",
                                "name": "name",
                                "scripts": [],
                                "id": "id",
                                "related_resources": [],
                                "memo": {
                                  "description": "description"
                                }
                              },
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description"
                              }
                            },
                            {
                              "resource_type": "Account",
                              "name": "name",
                              "patient": {
                                "resource_type": "Patient",
                                "name": "name",
                                "scripts": [],
                                "id": "id",
                                "related_resources": [],
                                "memo": {
                                  "description": "description"
                                }
                              },
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description"
                              }
                            }
                          ],
                          "memo": {
                            "description": "description"
                          }
                        },
                        "practitioner": {
                          "resource_type": "Practitioner",
                          "name": "name",
                          "id": "id",
                          "related_resources": [
                            {
                              "resource_type": "Account",
                              "name": "name",
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description"
                              }
                            },
                            {
                              "resource_type": "Account",
                              "name": "name",
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description"
                              }
                            }
                          ],
                          "memo": {
                            "description": "description"
                          }
                        },
                        "id": "id",
                        "related_resources": [
                          {
                            "resource_type": "Account",
                            "name": "name",
                            "patient": {
                              "resource_type": "Patient",
                              "name": "name",
                              "scripts": [],
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description"
                              }
                            },
                            "practitioner": {
                              "resource_type": "Practitioner",
                              "name": "name",
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description"
                              }
                            },
                            "id": "id",
                            "related_resources": [],
                            "memo": {
                              "description": "description"
                            }
                          },
                          {
                            "resource_type": "Account",
                            "name": "name",
                            "patient": {
                              "resource_type": "Patient",
                              "name": "name",
                              "scripts": [],
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description"
                              }
                            },
                            "practitioner": {
                              "resource_type": "Practitioner",
                              "name": "name",
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description"
                              }
                            },
                            "id": "id",
                            "related_resources": [],
                            "memo": {
                              "description": "description"
                            }
                          }
                        ],
                        "memo": {
                          "description": "description",
                          "account": {
                            "resource_type": "Account",
                            "name": "name",
                            "id": "id",
                            "related_resources": [],
                            "memo": {
                              "description": "description",
                              "account": {
                                "resource_type": "Account",
                                "name": "name",
                                "id": "id",
                                "related_resources": [],
                                "memo": {
                                  "description": "description"
                                }
                              }
                            }
                          }
                        }
                      },
                      {
                        "resource_type": "Account",
                        "name": "name",
                        "patient": {
                          "resource_type": "Patient",
                          "name": "name",
                          "scripts": [
                            {
                              "resource_type": "Script",
                              "name": "name",
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description"
                              }
                            },
                            {
                              "resource_type": "Script",
                              "name": "name",
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description"
                              }
                            }
                          ],
                          "id": "id",
                          "related_resources": [
                            {
                              "resource_type": "Account",
                              "name": "name",
                              "patient": {
                                "resource_type": "Patient",
                                "name": "name",
                                "scripts": [],
                                "id": "id",
                                "related_resources": [],
                                "memo": {
                                  "description": "description"
                                }
                              },
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description"
                              }
                            },
                            {
                              "resource_type": "Account",
                              "name": "name",
                              "patient": {
                                "resource_type": "Patient",
                                "name": "name",
                                "scripts": [],
                                "id": "id",
                                "related_resources": [],
                                "memo": {
                                  "description": "description"
                                }
                              },
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description"
                              }
                            }
                          ],
                          "memo": {
                            "description": "description"
                          }
                        },
                        "practitioner": {
                          "resource_type": "Practitioner",
                          "name": "name",
                          "id": "id",
                          "related_resources": [
                            {
                              "resource_type": "Account",
                              "name": "name",
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description"
                              }
                            },
                            {
                              "resource_type": "Account",
                              "name": "name",
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description"
                              }
                            }
                          ],
                          "memo": {
                            "description": "description"
                          }
                        },
                        "id": "id",
                        "related_resources": [
                          {
                            "resource_type": "Account",
                            "name": "name",
                            "patient": {
                              "resource_type": "Patient",
                              "name": "name",
                              "scripts": [],
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description"
                              }
                            },
                            "practitioner": {
                              "resource_type": "Practitioner",
                              "name": "name",
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description"
                              }
                            },
                            "id": "id",
                            "related_resources": [],
                            "memo": {
                              "description": "description"
                            }
                          },
                          {
                            "resource_type": "Account",
                            "name": "name",
                            "patient": {
                              "resource_type": "Patient",
                              "name": "name",
                              "scripts": [],
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description"
                              }
                            },
                            "practitioner": {
                              "resource_type": "Practitioner",
                              "name": "name",
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description"
                              }
                            },
                            "id": "id",
                            "related_resources": [],
                            "memo": {
                              "description": "description"
                            }
                          }
                        ],
                        "memo": {
                          "description": "description",
                          "account": {
                            "resource_type": "Account",
                            "name": "name",
                            "id": "id",
                            "related_resources": [],
                            "memo": {
                              "description": "description",
                              "account": {
                                "resource_type": "Account",
                                "name": "name",
                                "id": "id",
                                "related_resources": [],
                                "memo": {
                                  "description": "description"
                                }
                              }
                            }
                          }
                        }
                      }
                    ],
                    "memo": {
                      "description": "description",
                      "account": {
                        "resource_type": "Account",
                        "name": "name",
                        "patient": {
                          "resource_type": "Patient",
                          "name": "name",
                          "scripts": [],
                          "id": "id",
                          "related_resources": [],
                          "memo": {
                            "description": "description",
                            "account": {
                              "resource_type": "Account",
                              "name": "name",
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description"
                              }
                            }
                          }
                        },
                        "practitioner": {
                          "resource_type": "Practitioner",
                          "name": "name",
                          "id": "id",
                          "related_resources": [],
                          "memo": {
                            "description": "description",
                            "account": {
                              "resource_type": "Account",
                              "name": "name",
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description"
                              }
                            }
                          }
                        },
                        "id": "id",
                        "related_resources": [
                          {
                            "resource_type": "Account",
                            "name": "name",
                            "id": "id",
                            "related_resources": [],
                            "memo": {
                              "description": "description",
                              "account": {
                                "resource_type": "Account",
                                "name": "name",
                                "id": "id",
                                "related_resources": [],
                                "memo": {
                                  "description": "description"
                                }
                              }
                            }
                          },
                          {
                            "resource_type": "Account",
                            "name": "name",
                            "id": "id",
                            "related_resources": [],
                            "memo": {
                              "description": "description",
                              "account": {
                                "resource_type": "Account",
                                "name": "name",
                                "id": "id",
                                "related_resources": [],
                                "memo": {
                                  "description": "description"
                                }
                              }
                            }
                          }
                        ],
                        "memo": {
                          "description": "description",
                          "account": {
                            "resource_type": "Account",
                            "name": "name",
                            "id": "id",
                            "related_resources": [],
                            "memo": {
                              "description": "description"
                            }
                          }
                        }
                      }
                    }
                  },
                  "practitioner": {
                    "resource_type": "Practitioner",
                    "name": "name",
                    "id": "id",
                    "related_resources": [
                      {
                        "resource_type": "Account",
                        "name": "name",
                        "patient": {
                          "resource_type": "Patient",
                          "name": "name",
                          "scripts": [
                            {
                              "resource_type": "Script",
                              "name": "name",
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description"
                              }
                            },
                            {
                              "resource_type": "Script",
                              "name": "name",
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description"
                              }
                            }
                          ],
                          "id": "id",
                          "related_resources": [
                            {
                              "resource_type": "Account",
                              "name": "name",
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description"
                              }
                            },
                            {
                              "resource_type": "Account",
                              "name": "name",
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description"
                              }
                            }
                          ],
                          "memo": {
                            "description": "description"
                          }
                        },
                        "practitioner": {
                          "resource_type": "Practitioner",
                          "name": "name",
                          "id": "id",
                          "related_resources": [
                            {
                              "resource_type": "Account",
                              "name": "name",
                              "practitioner": {
                                "resource_type": "Practitioner",
                                "name": "name",
                                "id": "id",
                                "related_resources": [],
                                "memo": {
                                  "description": "description"
                                }
                              },
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description"
                              }
                            },
                            {
                              "resource_type": "Account",
                              "name": "name",
                              "practitioner": {
                                "resource_type": "Practitioner",
                                "name": "name",
                                "id": "id",
                                "related_resources": [],
                                "memo": {
                                  "description": "description"
                                }
                              },
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description"
                              }
                            }
                          ],
                          "memo": {
                            "description": "description"
                          }
                        },
                        "id": "id",
                        "related_resources": [
                          {
                            "resource_type": "Account",
                            "name": "name",
                            "patient": {
                              "resource_type": "Patient",
                              "name": "name",
                              "scripts": [],
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description"
                              }
                            },
                            "practitioner": {
                              "resource_type": "Practitioner",
                              "name": "name",
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description"
                              }
                            },
                            "id": "id",
                            "related_resources": [],
                            "memo": {
                              "description": "description"
                            }
                          },
                          {
                            "resource_type": "Account",
                            "name": "name",
                            "patient": {
                              "resource_type": "Patient",
                              "name": "name",
                              "scripts": [],
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description"
                              }
                            },
                            "practitioner": {
                              "resource_type": "Practitioner",
                              "name": "name",
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description"
                              }
                            },
                            "id": "id",
                            "related_resources": [],
                            "memo": {
                              "description": "description"
                            }
                          }
                        ],
                        "memo": {
                          "description": "description",
                          "account": {
                            "resource_type": "Account",
                            "name": "name",
                            "id": "id",
                            "related_resources": [],
                            "memo": {
                              "description": "description",
                              "account": {
                                "resource_type": "Account",
                                "name": "name",
                                "id": "id",
                                "related_resources": [],
                                "memo": {
                                  "description": "description"
                                }
                              }
                            }
                          }
                        }
                      },
                      {
                        "resource_type": "Account",
                        "name": "name",
                        "patient": {
                          "resource_type": "Patient",
                          "name": "name",
                          "scripts": [
                            {
                              "resource_type": "Script",
                              "name": "name",
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description"
                              }
                            },
                            {
                              "resource_type": "Script",
                              "name": "name",
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description"
                              }
                            }
                          ],
                          "id": "id",
                          "related_resources": [
                            {
                              "resource_type": "Account",
                              "name": "name",
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description"
                              }
                            },
                            {
                              "resource_type": "Account",
                              "name": "name",
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description"
                              }
                            }
                          ],
                          "memo": {
                            "description": "description"
                          }
                        },
                        "practitioner": {
                          "resource_type": "Practitioner",
                          "name": "name",
                          "id": "id",
                          "related_resources": [
                            {
                              "resource_type": "Account",
                              "name": "name",
                              "practitioner": {
                                "resource_type": "Practitioner",
                                "name": "name",
                                "id": "id",
                                "related_resources": [],
                                "memo": {
                                  "description": "description"
                                }
                              },
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description"
                              }
                            },
                            {
                              "resource_type": "Account",
                              "name": "name",
                              "practitioner": {
                                "resource_type": "Practitioner",
                                "name": "name",
                                "id": "id",
                                "related_resources": [],
                                "memo": {
                                  "description": "description"
                                }
                              },
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description"
                              }
                            }
                          ],
                          "memo": {
                            "description": "description"
                          }
                        },
                        "id": "id",
                        "related_resources": [
                          {
                            "resource_type": "Account",
                            "name": "name",
                            "patient": {
                              "resource_type": "Patient",
                              "name": "name",
                              "scripts": [],
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description"
                              }
                            },
                            "practitioner": {
                              "resource_type": "Practitioner",
                              "name": "name",
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description"
                              }
                            },
                            "id": "id",
                            "related_resources": [],
                            "memo": {
                              "description": "description"
                            }
                          },
                          {
                            "resource_type": "Account",
                            "name": "name",
                            "patient": {
                              "resource_type": "Patient",
                              "name": "name",
                              "scripts": [],
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description"
                              }
                            },
                            "practitioner": {
                              "resource_type": "Practitioner",
                              "name": "name",
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description"
                              }
                            },
                            "id": "id",
                            "related_resources": [],
                            "memo": {
                              "description": "description"
                            }
                          }
                        ],
                        "memo": {
                          "description": "description",
                          "account": {
                            "resource_type": "Account",
                            "name": "name",
                            "id": "id",
                            "related_resources": [],
                            "memo": {
                              "description": "description",
                              "account": {
                                "resource_type": "Account",
                                "name": "name",
                                "id": "id",
                                "related_resources": [],
                                "memo": {
                                  "description": "description"
                                }
                              }
                            }
                          }
                        }
                      }
                    ],
                    "memo": {
                      "description": "description",
                      "account": {
                        "resource_type": "Account",
                        "name": "name",
                        "patient": {
                          "resource_type": "Patient",
                          "name": "name",
                          "scripts": [],
                          "id": "id",
                          "related_resources": [],
                          "memo": {
                            "description": "description",
                            "account": {
                              "resource_type": "Account",
                              "name": "name",
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description"
                              }
                            }
                          }
                        },
                        "practitioner": {
                          "resource_type": "Practitioner",
                          "name": "name",
                          "id": "id",
                          "related_resources": [],
                          "memo": {
                            "description": "description",
                            "account": {
                              "resource_type": "Account",
                              "name": "name",
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description"
                              }
                            }
                          }
                        },
                        "id": "id",
                        "related_resources": [
                          {
                            "resource_type": "Account",
                            "name": "name",
                            "id": "id",
                            "related_resources": [],
                            "memo": {
                              "description": "description",
                              "account": {
                                "resource_type": "Account",
                                "name": "name",
                                "id": "id",
                                "related_resources": [],
                                "memo": {
                                  "description": "description"
                                }
                              }
                            }
                          },
                          {
                            "resource_type": "Account",
                            "name": "name",
                            "id": "id",
                            "related_resources": [],
                            "memo": {
                              "description": "description",
                              "account": {
                                "resource_type": "Account",
                                "name": "name",
                                "id": "id",
                                "related_resources": [],
                                "memo": {
                                  "description": "description"
                                }
                              }
                            }
                          }
                        ],
                        "memo": {
                          "description": "description",
                          "account": {
                            "resource_type": "Account",
                            "name": "name",
                            "id": "id",
                            "related_resources": [],
                            "memo": {
                              "description": "description"
                            }
                          }
                        }
                      }
                    }
                  },
                  "id": "id",
                  "related_resources": [
                    {
                      "resource_type": "Account",
                      "name": "name",
                      "patient": {
                        "resource_type": "Patient",
                        "name": "name",
                        "scripts": [
                          {
                            "resource_type": "Script",
                            "name": "name",
                            "id": "id",
                            "related_resources": [
                              {
                                "resource_type": "Account",
                                "name": "name",
                                "id": "id",
                                "related_resources": [],
                                "memo": {
                                  "description": "description"
                                }
                              },
                              {
                                "resource_type": "Account",
                                "name": "name",
                                "id": "id",
                                "related_resources": [],
                                "memo": {
                                  "description": "description"
                                }
                              }
                            ],
                            "memo": {
                              "description": "description"
                            }
                          },
                          {
                            "resource_type": "Script",
                            "name": "name",
                            "id": "id",
                            "related_resources": [
                              {
                                "resource_type": "Account",
                                "name": "name",
                                "id": "id",
                                "related_resources": [],
                                "memo": {
                                  "description": "description"
                                }
                              },
                              {
                                "resource_type": "Account",
                                "name": "name",
                                "id": "id",
                                "related_resources": [],
                                "memo": {
                                  "description": "description"
                                }
                              }
                            ],
                            "memo": {
                              "description": "description"
                            }
                          }
                        ],
                        "id": "id",
                        "related_resources": [
                          {
                            "resource_type": "Account",
                            "name": "name",
                            "patient": {
                              "resource_type": "Patient",
                              "name": "name",
                              "scripts": [],
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description"
                              }
                            },
                            "practitioner": {
                              "resource_type": "Practitioner",
                              "name": "name",
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description"
                              }
                            },
                            "id": "id",
                            "related_resources": [],
                            "memo": {
                              "description": "description"
                            }
                          },
                          {
                            "resource_type": "Account",
                            "name": "name",
                            "patient": {
                              "resource_type": "Patient",
                              "name": "name",
                              "scripts": [],
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description"
                              }
                            },
                            "practitioner": {
                              "resource_type": "Practitioner",
                              "name": "name",
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description"
                              }
                            },
                            "id": "id",
                            "related_resources": [],
                            "memo": {
                              "description": "description"
                            }
                          }
                        ],
                        "memo": {
                          "description": "description",
                          "account": {
                            "resource_type": "Account",
                            "name": "name",
                            "id": "id",
                            "related_resources": [],
                            "memo": {
                              "description": "description",
                              "account": {
                                "resource_type": "Account",
                                "name": "name",
                                "id": "id",
                                "related_resources": [],
                                "memo": {
                                  "description": "description"
                                }
                              }
                            }
                          }
                        }
                      },
                      "practitioner": {
                        "resource_type": "Practitioner",
                        "name": "name",
                        "id": "id",
                        "related_resources": [
                          {
                            "resource_type": "Account",
                            "name": "name",
                            "patient": {
                              "resource_type": "Patient",
                              "name": "name",
                              "scripts": [],
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description"
                              }
                            },
                            "practitioner": {
                              "resource_type": "Practitioner",
                              "name": "name",
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description"
                              }
                            },
                            "id": "id",
                            "related_resources": [],
                            "memo": {
                              "description": "description"
                            }
                          },
                          {
                            "resource_type": "Account",
                            "name": "name",
                            "patient": {
                              "resource_type": "Patient",
                              "name": "name",
                              "scripts": [],
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description"
                              }
                            },
                            "practitioner": {
                              "resource_type": "Practitioner",
                              "name": "name",
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description"
                              }
                            },
                            "id": "id",
                            "related_resources": [],
                            "memo": {
                              "description": "description"
                            }
                          }
                        ],
                        "memo": {
                          "description": "description",
                          "account": {
                            "resource_type": "Account",
                            "name": "name",
                            "id": "id",
                            "related_resources": [],
                            "memo": {
                              "description": "description",
                              "account": {
                                "resource_type": "Account",
                                "name": "name",
                                "id": "id",
                                "related_resources": [],
                                "memo": {
                                  "description": "description"
                                }
                              }
                            }
                          }
                        }
                      },
                      "id": "id",
                      "related_resources": [
                        {
                          "resource_type": "Account",
                          "name": "name",
                          "patient": {
                            "resource_type": "Patient",
                            "name": "name",
                            "scripts": [
                              {
                                "resource_type": "Script",
                                "name": "name",
                                "id": "id",
                                "related_resources": [],
                                "memo": {
                                  "description": "description"
                                }
                              },
                              {
                                "resource_type": "Script",
                                "name": "name",
                                "id": "id",
                                "related_resources": [],
                                "memo": {
                                  "description": "description"
                                }
                              }
                            ],
                            "id": "id",
                            "related_resources": [],
                            "memo": {
                              "description": "description"
                            }
                          },
                          "practitioner": {
                            "resource_type": "Practitioner",
                            "name": "name",
                            "id": "id",
                            "related_resources": [],
                            "memo": {
                              "description": "description"
                            }
                          },
                          "id": "id",
                          "related_resources": [],
                          "memo": {
                            "description": "description",
                            "account": {
                              "resource_type": "Account",
                              "name": "name",
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description",
                                "account": {
                                  "resource_type": "Account",
                                  "name": "name",
                                  "id": "id",
                                  "related_resources": [],
                                  "memo": {
                                    "description": "description"
                                  }
                                }
                              }
                            }
                          }
                        },
                        {
                          "resource_type": "Account",
                          "name": "name",
                          "patient": {
                            "resource_type": "Patient",
                            "name": "name",
                            "scripts": [
                              {
                                "resource_type": "Script",
                                "name": "name",
                                "id": "id",
                                "related_resources": [],
                                "memo": {
                                  "description": "description"
                                }
                              },
                              {
                                "resource_type": "Script",
                                "name": "name",
                                "id": "id",
                                "related_resources": [],
                                "memo": {
                                  "description": "description"
                                }
                              }
                            ],
                            "id": "id",
                            "related_resources": [],
                            "memo": {
                              "description": "description"
                            }
                          },
                          "practitioner": {
                            "resource_type": "Practitioner",
                            "name": "name",
                            "id": "id",
                            "related_resources": [],
                            "memo": {
                              "description": "description"
                            }
                          },
                          "id": "id",
                          "related_resources": [],
                          "memo": {
                            "description": "description",
                            "account": {
                              "resource_type": "Account",
                              "name": "name",
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description",
                                "account": {
                                  "resource_type": "Account",
                                  "name": "name",
                                  "id": "id",
                                  "related_resources": [],
                                  "memo": {
                                    "description": "description"
                                  }
                                }
                              }
                            }
                          }
                        }
                      ],
                      "memo": {
                        "description": "description",
                        "account": {
                          "resource_type": "Account",
                          "name": "name",
                          "patient": {
                            "resource_type": "Patient",
                            "name": "name",
                            "scripts": [],
                            "id": "id",
                            "related_resources": [],
                            "memo": {
                              "description": "description",
                              "account": {
                                "resource_type": "Account",
                                "name": "name",
                                "id": "id",
                                "related_resources": [],
                                "memo": {
                                  "description": "description"
                                }
                              }
                            }
                          },
                          "practitioner": {
                            "resource_type": "Practitioner",
                            "name": "name",
                            "id": "id",
                            "related_resources": [],
                            "memo": {
                              "description": "description",
                              "account": {
                                "resource_type": "Account",
                                "name": "name",
                                "id": "id",
                                "related_resources": [],
                                "memo": {
                                  "description": "description"
                                }
                              }
                            }
                          },
                          "id": "id",
                          "related_resources": [
                            {
                              "resource_type": "Account",
                              "name": "name",
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description",
                                "account": {
                                  "resource_type": "Account",
                                  "name": "name",
                                  "id": "id",
                                  "related_resources": [],
                                  "memo": {
                                    "description": "description"
                                  }
                                }
                              }
                            },
                            {
                              "resource_type": "Account",
                              "name": "name",
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description",
                                "account": {
                                  "resource_type": "Account",
                                  "name": "name",
                                  "id": "id",
                                  "related_resources": [],
                                  "memo": {
                                    "description": "description"
                                  }
                                }
                              }
                            }
                          ],
                          "memo": {
                            "description": "description",
                            "account": {
                              "resource_type": "Account",
                              "name": "name",
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description"
                              }
                            }
                          }
                        }
                      }
                    },
                    {
                      "resource_type": "Account",
                      "name": "name",
                      "patient": {
                        "resource_type": "Patient",
                        "name": "name",
                        "scripts": [
                          {
                            "resource_type": "Script",
                            "name": "name",
                            "id": "id",
                            "related_resources": [
                              {
                                "resource_type": "Account",
                                "name": "name",
                                "id": "id",
                                "related_resources": [],
                                "memo": {
                                  "description": "description"
                                }
                              },
                              {
                                "resource_type": "Account",
                                "name": "name",
                                "id": "id",
                                "related_resources": [],
                                "memo": {
                                  "description": "description"
                                }
                              }
                            ],
                            "memo": {
                              "description": "description"
                            }
                          },
                          {
                            "resource_type": "Script",
                            "name": "name",
                            "id": "id",
                            "related_resources": [
                              {
                                "resource_type": "Account",
                                "name": "name",
                                "id": "id",
                                "related_resources": [],
                                "memo": {
                                  "description": "description"
                                }
                              },
                              {
                                "resource_type": "Account",
                                "name": "name",
                                "id": "id",
                                "related_resources": [],
                                "memo": {
                                  "description": "description"
                                }
                              }
                            ],
                            "memo": {
                              "description": "description"
                            }
                          }
                        ],
                        "id": "id",
                        "related_resources": [
                          {
                            "resource_type": "Account",
                            "name": "name",
                            "patient": {
                              "resource_type": "Patient",
                              "name": "name",
                              "scripts": [],
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description"
                              }
                            },
                            "practitioner": {
                              "resource_type": "Practitioner",
                              "name": "name",
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description"
                              }
                            },
                            "id": "id",
                            "related_resources": [],
                            "memo": {
                              "description": "description"
                            }
                          },
                          {
                            "resource_type": "Account",
                            "name": "name",
                            "patient": {
                              "resource_type": "Patient",
                              "name": "name",
                              "scripts": [],
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description"
                              }
                            },
                            "practitioner": {
                              "resource_type": "Practitioner",
                              "name": "name",
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description"
                              }
                            },
                            "id": "id",
                            "related_resources": [],
                            "memo": {
                              "description": "description"
                            }
                          }
                        ],
                        "memo": {
                          "description": "description",
                          "account": {
                            "resource_type": "Account",
                            "name": "name",
                            "id": "id",
                            "related_resources": [],
                            "memo": {
                              "description": "description",
                              "account": {
                                "resource_type": "Account",
                                "name": "name",
                                "id": "id",
                                "related_resources": [],
                                "memo": {
                                  "description": "description"
                                }
                              }
                            }
                          }
                        }
                      },
                      "practitioner": {
                        "resource_type": "Practitioner",
                        "name": "name",
                        "id": "id",
                        "related_resources": [
                          {
                            "resource_type": "Account",
                            "name": "name",
                            "patient": {
                              "resource_type": "Patient",
                              "name": "name",
                              "scripts": [],
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description"
                              }
                            },
                            "practitioner": {
                              "resource_type": "Practitioner",
                              "name": "name",
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description"
                              }
                            },
                            "id": "id",
                            "related_resources": [],
                            "memo": {
                              "description": "description"
                            }
                          },
                          {
                            "resource_type": "Account",
                            "name": "name",
                            "patient": {
                              "resource_type": "Patient",
                              "name": "name",
                              "scripts": [],
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description"
                              }
                            },
                            "practitioner": {
                              "resource_type": "Practitioner",
                              "name": "name",
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description"
                              }
                            },
                            "id": "id",
                            "related_resources": [],
                            "memo": {
                              "description": "description"
                            }
                          }
                        ],
                        "memo": {
                          "description": "description",
                          "account": {
                            "resource_type": "Account",
                            "name": "name",
                            "id": "id",
                            "related_resources": [],
                            "memo": {
                              "description": "description",
                              "account": {
                                "resource_type": "Account",
                                "name": "name",
                                "id": "id",
                                "related_resources": [],
                                "memo": {
                                  "description": "description"
                                }
                              }
                            }
                          }
                        }
                      },
                      "id": "id",
                      "related_resources": [
                        {
                          "resource_type": "Account",
                          "name": "name",
                          "patient": {
                            "resource_type": "Patient",
                            "name": "name",
                            "scripts": [
                              {
                                "resource_type": "Script",
                                "name": "name",
                                "id": "id",
                                "related_resources": [],
                                "memo": {
                                  "description": "description"
                                }
                              },
                              {
                                "resource_type": "Script",
                                "name": "name",
                                "id": "id",
                                "related_resources": [],
                                "memo": {
                                  "description": "description"
                                }
                              }
                            ],
                            "id": "id",
                            "related_resources": [],
                            "memo": {
                              "description": "description"
                            }
                          },
                          "practitioner": {
                            "resource_type": "Practitioner",
                            "name": "name",
                            "id": "id",
                            "related_resources": [],
                            "memo": {
                              "description": "description"
                            }
                          },
                          "id": "id",
                          "related_resources": [],
                          "memo": {
                            "description": "description",
                            "account": {
                              "resource_type": "Account",
                              "name": "name",
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description",
                                "account": {
                                  "resource_type": "Account",
                                  "name": "name",
                                  "id": "id",
                                  "related_resources": [],
                                  "memo": {
                                    "description": "description"
                                  }
                                }
                              }
                            }
                          }
                        },
                        {
                          "resource_type": "Account",
                          "name": "name",
                          "patient": {
                            "resource_type": "Patient",
                            "name": "name",
                            "scripts": [
                              {
                                "resource_type": "Script",
                                "name": "name",
                                "id": "id",
                                "related_resources": [],
                                "memo": {
                                  "description": "description"
                                }
                              },
                              {
                                "resource_type": "Script",
                                "name": "name",
                                "id": "id",
                                "related_resources": [],
                                "memo": {
                                  "description": "description"
                                }
                              }
                            ],
                            "id": "id",
                            "related_resources": [],
                            "memo": {
                              "description": "description"
                            }
                          },
                          "practitioner": {
                            "resource_type": "Practitioner",
                            "name": "name",
                            "id": "id",
                            "related_resources": [],
                            "memo": {
                              "description": "description"
                            }
                          },
                          "id": "id",
                          "related_resources": [],
                          "memo": {
                            "description": "description",
                            "account": {
                              "resource_type": "Account",
                              "name": "name",
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description",
                                "account": {
                                  "resource_type": "Account",
                                  "name": "name",
                                  "id": "id",
                                  "related_resources": [],
                                  "memo": {
                                    "description": "description"
                                  }
                                }
                              }
                            }
                          }
                        }
                      ],
                      "memo": {
                        "description": "description",
                        "account": {
                          "resource_type": "Account",
                          "name": "name",
                          "patient": {
                            "resource_type": "Patient",
                            "name": "name",
                            "scripts": [],
                            "id": "id",
                            "related_resources": [],
                            "memo": {
                              "description": "description",
                              "account": {
                                "resource_type": "Account",
                                "name": "name",
                                "id": "id",
                                "related_resources": [],
                                "memo": {
                                  "description": "description"
                                }
                              }
                            }
                          },
                          "practitioner": {
                            "resource_type": "Practitioner",
                            "name": "name",
                            "id": "id",
                            "related_resources": [],
                            "memo": {
                              "description": "description",
                              "account": {
                                "resource_type": "Account",
                                "name": "name",
                                "id": "id",
                                "related_resources": [],
                                "memo": {
                                  "description": "description"
                                }
                              }
                            }
                          },
                          "id": "id",
                          "related_resources": [
                            {
                              "resource_type": "Account",
                              "name": "name",
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description",
                                "account": {
                                  "resource_type": "Account",
                                  "name": "name",
                                  "id": "id",
                                  "related_resources": [],
                                  "memo": {
                                    "description": "description"
                                  }
                                }
                              }
                            },
                            {
                              "resource_type": "Account",
                              "name": "name",
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description",
                                "account": {
                                  "resource_type": "Account",
                                  "name": "name",
                                  "id": "id",
                                  "related_resources": [],
                                  "memo": {
                                    "description": "description"
                                  }
                                }
                              }
                            }
                          ],
                          "memo": {
                            "description": "description",
                            "account": {
                              "resource_type": "Account",
                              "name": "name",
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description"
                              }
                            }
                          }
                        }
                      }
                    }
                  ],
                  "memo": {
                    "description": "description",
                    "account": {
                      "resource_type": "Account",
                      "name": "name",
                      "patient": {
                        "resource_type": "Patient",
                        "name": "name",
                        "scripts": [
                          {
                            "resource_type": "Script",
                            "name": "name",
                            "id": "id",
                            "related_resources": [],
                            "memo": {
                              "description": "description",
                              "account": {
                                "resource_type": "Account",
                                "name": "name",
                                "id": "id",
                                "related_resources": [],
                                "memo": {
                                  "description": "description"
                                }
                              }
                            }
                          },
                          {
                            "resource_type": "Script",
                            "name": "name",
                            "id": "id",
                            "related_resources": [],
                            "memo": {
                              "description": "description",
                              "account": {
                                "resource_type": "Account",
                                "name": "name",
                                "id": "id",
                                "related_resources": [],
                                "memo": {
                                  "description": "description"
                                }
                              }
                            }
                          }
                        ],
                        "id": "id",
                        "related_resources": [
                          {
                            "resource_type": "Account",
                            "name": "name",
                            "id": "id",
                            "related_resources": [],
                            "memo": {
                              "description": "description",
                              "account": {
                                "resource_type": "Account",
                                "name": "name",
                                "id": "id",
                                "related_resources": [],
                                "memo": {
                                  "description": "description"
                                }
                              }
                            }
                          },
                          {
                            "resource_type": "Account",
                            "name": "name",
                            "id": "id",
                            "related_resources": [],
                            "memo": {
                              "description": "description",
                              "account": {
                                "resource_type": "Account",
                                "name": "name",
                                "id": "id",
                                "related_resources": [],
                                "memo": {
                                  "description": "description"
                                }
                              }
                            }
                          }
                        ],
                        "memo": {
                          "description": "description",
                          "account": {
                            "resource_type": "Account",
                            "name": "name",
                            "id": "id",
                            "related_resources": [],
                            "memo": {
                              "description": "description"
                            }
                          }
                        }
                      },
                      "practitioner": {
                        "resource_type": "Practitioner",
                        "name": "name",
                        "id": "id",
                        "related_resources": [
                          {
                            "resource_type": "Account",
                            "name": "name",
                            "id": "id",
                            "related_resources": [],
                            "memo": {
                              "description": "description",
                              "account": {
                                "resource_type": "Account",
                                "name": "name",
                                "id": "id",
                                "related_resources": [],
                                "memo": {
                                  "description": "description"
                                }
                              }
                            }
                          },
                          {
                            "resource_type": "Account",
                            "name": "name",
                            "id": "id",
                            "related_resources": [],
                            "memo": {
                              "description": "description",
                              "account": {
                                "resource_type": "Account",
                                "name": "name",
                                "id": "id",
                                "related_resources": [],
                                "memo": {
                                  "description": "description"
                                }
                              }
                            }
                          }
                        ],
                        "memo": {
                          "description": "description",
                          "account": {
                            "resource_type": "Account",
                            "name": "name",
                            "id": "id",
                            "related_resources": [],
                            "memo": {
                              "description": "description"
                            }
                          }
                        }
                      },
                      "id": "id",
                      "related_resources": [
                        {
                          "resource_type": "Account",
                          "name": "name",
                          "patient": {
                            "resource_type": "Patient",
                            "name": "name",
                            "scripts": [],
                            "id": "id",
                            "related_resources": [],
                            "memo": {
                              "description": "description",
                              "account": {
                                "resource_type": "Account",
                                "name": "name",
                                "id": "id",
                                "related_resources": [],
                                "memo": {
                                  "description": "description"
                                }
                              }
                            }
                          },
                          "practitioner": {
                            "resource_type": "Practitioner",
                            "name": "name",
                            "id": "id",
                            "related_resources": [],
                            "memo": {
                              "description": "description",
                              "account": {
                                "resource_type": "Account",
                                "name": "name",
                                "id": "id",
                                "related_resources": [],
                                "memo": {
                                  "description": "description"
                                }
                              }
                            }
                          },
                          "id": "id",
                          "related_resources": [
                            {
                              "resource_type": "Account",
                              "name": "name",
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description",
                                "account": {
                                  "resource_type": "Account",
                                  "name": "name",
                                  "id": "id",
                                  "related_resources": [],
                                  "memo": {
                                    "description": "description"
                                  }
                                }
                              }
                            },
                            {
                              "resource_type": "Account",
                              "name": "name",
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description",
                                "account": {
                                  "resource_type": "Account",
                                  "name": "name",
                                  "id": "id",
                                  "related_resources": [],
                                  "memo": {
                                    "description": "description"
                                  }
                                }
                              }
                            }
                          ],
                          "memo": {
                            "description": "description",
                            "account": {
                              "resource_type": "Account",
                              "name": "name",
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description"
                              }
                            }
                          }
                        },
                        {
                          "resource_type": "Account",
                          "name": "name",
                          "patient": {
                            "resource_type": "Patient",
                            "name": "name",
                            "scripts": [],
                            "id": "id",
                            "related_resources": [],
                            "memo": {
                              "description": "description",
                              "account": {
                                "resource_type": "Account",
                                "name": "name",
                                "id": "id",
                                "related_resources": [],
                                "memo": {
                                  "description": "description"
                                }
                              }
                            }
                          },
                          "practitioner": {
                            "resource_type": "Practitioner",
                            "name": "name",
                            "id": "id",
                            "related_resources": [],
                            "memo": {
                              "description": "description",
                              "account": {
                                "resource_type": "Account",
                                "name": "name",
                                "id": "id",
                                "related_resources": [],
                                "memo": {
                                  "description": "description"
                                }
                              }
                            }
                          },
                          "id": "id",
                          "related_resources": [
                            {
                              "resource_type": "Account",
                              "name": "name",
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description",
                                "account": {
                                  "resource_type": "Account",
                                  "name": "name",
                                  "id": "id",
                                  "related_resources": [],
                                  "memo": {
                                    "description": "description"
                                  }
                                }
                              }
                            },
                            {
                              "resource_type": "Account",
                              "name": "name",
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description",
                                "account": {
                                  "resource_type": "Account",
                                  "name": "name",
                                  "id": "id",
                                  "related_resources": [],
                                  "memo": {
                                    "description": "description"
                                  }
                                }
                              }
                            }
                          ],
                          "memo": {
                            "description": "description",
                            "account": {
                              "resource_type": "Account",
                              "name": "name",
                              "id": "id",
                              "related_resources": [],
                              "memo": {
                                "description": "description"
                              }
                            }
                          }
                        }
                      ],
                      "memo": {
                        "description": "description",
                        "account": {
                          "resource_type": "Account",
                          "name": "name",
                          "id": "id",
                          "related_resources": [],
                          "memo": {
                            "description": "description"
                          }
                        }
                      }
                    }
                  }
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = Account(
            resourceType: .account,
            name: "name",
            patient: Optional(Patient(
                resourceType: .patient,
                name: "name",
                scripts: [
                    Script(
                        resourceType: .script,
                        name: "name",
                        id: "id",
                        relatedResources: [
                            ResourceList.account(
                                .init(
                                    resourceType: .account,
                                    name: "name",
                                    patient: Optional(Patient(
                                        resourceType: .patient,
                                        name: "name",
                                        scripts: [],
                                        id: "id",
                                        relatedResources: [],
                                        memo: Memo(
                                            description: "description"
                                        )
                                    )),
                                    practitioner: Optional(Practitioner(
                                        resourceType: .practitioner,
                                        name: "name",
                                        id: "id",
                                        relatedResources: [],
                                        memo: Memo(
                                            description: "description"
                                        )
                                    )),
                                    id: "id",
                                    relatedResources: [
                                        ResourceList.account(
                                            .init(
                                                resourceType: .account,
                                                name: "name",
                                                id: "id",
                                                relatedResources: [],
                                                memo: Memo(
                                                    description: "description"
                                                )
                                            )
                                        ),
                                        ResourceList.account(
                                            .init(
                                                resourceType: .account,
                                                name: "name",
                                                id: "id",
                                                relatedResources: [],
                                                memo: Memo(
                                                    description: "description"
                                                )
                                            )
                                        )
                                    ],
                                    memo: Memo(
                                        description: "description"
                                    )
                                )
                            ),
                            ResourceList.account(
                                .init(
                                    resourceType: .account,
                                    name: "name",
                                    patient: Optional(Patient(
                                        resourceType: .patient,
                                        name: "name",
                                        scripts: [],
                                        id: "id",
                                        relatedResources: [],
                                        memo: Memo(
                                            description: "description"
                                        )
                                    )),
                                    practitioner: Optional(Practitioner(
                                        resourceType: .practitioner,
                                        name: "name",
                                        id: "id",
                                        relatedResources: [],
                                        memo: Memo(
                                            description: "description"
                                        )
                                    )),
                                    id: "id",
                                    relatedResources: [
                                        ResourceList.account(
                                            .init(
                                                resourceType: .account,
                                                name: "name",
                                                id: "id",
                                                relatedResources: [],
                                                memo: Memo(
                                                    description: "description"
                                                )
                                            )
                                        ),
                                        ResourceList.account(
                                            .init(
                                                resourceType: .account,
                                                name: "name",
                                                id: "id",
                                                relatedResources: [],
                                                memo: Memo(
                                                    description: "description"
                                                )
                                            )
                                        )
                                    ],
                                    memo: Memo(
                                        description: "description"
                                    )
                                )
                            )
                        ],
                        memo: Memo(
                            description: "description",
                            account: Optional(Account(
                                resourceType: .account,
                                name: "name",
                                id: "id",
                                relatedResources: [],
                                memo: Memo(
                                    description: "description",
                                    account: Optional(Account(
                                        resourceType: .account,
                                        name: "name",
                                        id: "id",
                                        relatedResources: [],
                                        memo: Memo(
                                            description: "description"
                                        )
                                    ))
                                )
                            ))
                        )
                    ),
                    Script(
                        resourceType: .script,
                        name: "name",
                        id: "id",
                        relatedResources: [
                            ResourceList.account(
                                .init(
                                    resourceType: .account,
                                    name: "name",
                                    patient: Optional(Patient(
                                        resourceType: .patient,
                                        name: "name",
                                        scripts: [],
                                        id: "id",
                                        relatedResources: [],
                                        memo: Memo(
                                            description: "description"
                                        )
                                    )),
                                    practitioner: Optional(Practitioner(
                                        resourceType: .practitioner,
                                        name: "name",
                                        id: "id",
                                        relatedResources: [],
                                        memo: Memo(
                                            description: "description"
                                        )
                                    )),
                                    id: "id",
                                    relatedResources: [
                                        ResourceList.account(
                                            .init(
                                                resourceType: .account,
                                                name: "name",
                                                id: "id",
                                                relatedResources: [],
                                                memo: Memo(
                                                    description: "description"
                                                )
                                            )
                                        ),
                                        ResourceList.account(
                                            .init(
                                                resourceType: .account,
                                                name: "name",
                                                id: "id",
                                                relatedResources: [],
                                                memo: Memo(
                                                    description: "description"
                                                )
                                            )
                                        )
                                    ],
                                    memo: Memo(
                                        description: "description"
                                    )
                                )
                            ),
                            ResourceList.account(
                                .init(
                                    resourceType: .account,
                                    name: "name",
                                    patient: Optional(Patient(
                                        resourceType: .patient,
                                        name: "name",
                                        scripts: [],
                                        id: "id",
                                        relatedResources: [],
                                        memo: Memo(
                                            description: "description"
                                        )
                                    )),
                                    practitioner: Optional(Practitioner(
                                        resourceType: .practitioner,
                                        name: "name",
                                        id: "id",
                                        relatedResources: [],
                                        memo: Memo(
                                            description: "description"
                                        )
                                    )),
                                    id: "id",
                                    relatedResources: [
                                        ResourceList.account(
                                            .init(
                                                resourceType: .account,
                                                name: "name",
                                                id: "id",
                                                relatedResources: [],
                                                memo: Memo(
                                                    description: "description"
                                                )
                                            )
                                        ),
                                        ResourceList.account(
                                            .init(
                                                resourceType: .account,
                                                name: "name",
                                                id: "id",
                                                relatedResources: [],
                                                memo: Memo(
                                                    description: "description"
                                                )
                                            )
                                        )
                                    ],
                                    memo: Memo(
                                        description: "description"
                                    )
                                )
                            )
                        ],
                        memo: Memo(
                            description: "description",
                            account: Optional(Account(
                                resourceType: .account,
                                name: "name",
                                id: "id",
                                relatedResources: [],
                                memo: Memo(
                                    description: "description",
                                    account: Optional(Account(
                                        resourceType: .account,
                                        name: "name",
                                        id: "id",
                                        relatedResources: [],
                                        memo: Memo(
                                            description: "description"
                                        )
                                    ))
                                )
                            ))
                        )
                    )
                ],
                id: "id",
                relatedResources: [
                    ResourceList.account(
                        .init(
                            resourceType: .account,
                            name: "name",
                            patient: Optional(Patient(
                                resourceType: .patient,
                                name: "name",
                                scripts: [
                                    Script(
                                        resourceType: .script,
                                        name: "name",
                                        id: "id",
                                        relatedResources: [],
                                        memo: Memo(
                                            description: "description"
                                        )
                                    ),
                                    Script(
                                        resourceType: .script,
                                        name: "name",
                                        id: "id",
                                        relatedResources: [],
                                        memo: Memo(
                                            description: "description"
                                        )
                                    )
                                ],
                                id: "id",
                                relatedResources: [
                                    ResourceList.account(
                                        .init(
                                            resourceType: .account,
                                            name: "name",
                                            patient: Optional(Patient(
                                                resourceType: .patient,
                                                name: "name",
                                                scripts: [],
                                                id: "id",
                                                relatedResources: [],
                                                memo: Memo(
                                                    description: "description"
                                                )
                                            )),
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description"
                                            )
                                        )
                                    ),
                                    ResourceList.account(
                                        .init(
                                            resourceType: .account,
                                            name: "name",
                                            patient: Optional(Patient(
                                                resourceType: .patient,
                                                name: "name",
                                                scripts: [],
                                                id: "id",
                                                relatedResources: [],
                                                memo: Memo(
                                                    description: "description"
                                                )
                                            )),
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description"
                                            )
                                        )
                                    )
                                ],
                                memo: Memo(
                                    description: "description"
                                )
                            )),
                            practitioner: Optional(Practitioner(
                                resourceType: .practitioner,
                                name: "name",
                                id: "id",
                                relatedResources: [
                                    ResourceList.account(
                                        .init(
                                            resourceType: .account,
                                            name: "name",
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description"
                                            )
                                        )
                                    ),
                                    ResourceList.account(
                                        .init(
                                            resourceType: .account,
                                            name: "name",
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description"
                                            )
                                        )
                                    )
                                ],
                                memo: Memo(
                                    description: "description"
                                )
                            )),
                            id: "id",
                            relatedResources: [
                                ResourceList.account(
                                    .init(
                                        resourceType: .account,
                                        name: "name",
                                        patient: Optional(Patient(
                                            resourceType: .patient,
                                            name: "name",
                                            scripts: [],
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description"
                                            )
                                        )),
                                        practitioner: Optional(Practitioner(
                                            resourceType: .practitioner,
                                            name: "name",
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description"
                                            )
                                        )),
                                        id: "id",
                                        relatedResources: [],
                                        memo: Memo(
                                            description: "description"
                                        )
                                    )
                                ),
                                ResourceList.account(
                                    .init(
                                        resourceType: .account,
                                        name: "name",
                                        patient: Optional(Patient(
                                            resourceType: .patient,
                                            name: "name",
                                            scripts: [],
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description"
                                            )
                                        )),
                                        practitioner: Optional(Practitioner(
                                            resourceType: .practitioner,
                                            name: "name",
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description"
                                            )
                                        )),
                                        id: "id",
                                        relatedResources: [],
                                        memo: Memo(
                                            description: "description"
                                        )
                                    )
                                )
                            ],
                            memo: Memo(
                                description: "description",
                                account: Optional(Account(
                                    resourceType: .account,
                                    name: "name",
                                    id: "id",
                                    relatedResources: [],
                                    memo: Memo(
                                        description: "description",
                                        account: Optional(Account(
                                            resourceType: .account,
                                            name: "name",
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description"
                                            )
                                        ))
                                    )
                                ))
                            )
                        )
                    ),
                    ResourceList.account(
                        .init(
                            resourceType: .account,
                            name: "name",
                            patient: Optional(Patient(
                                resourceType: .patient,
                                name: "name",
                                scripts: [
                                    Script(
                                        resourceType: .script,
                                        name: "name",
                                        id: "id",
                                        relatedResources: [],
                                        memo: Memo(
                                            description: "description"
                                        )
                                    ),
                                    Script(
                                        resourceType: .script,
                                        name: "name",
                                        id: "id",
                                        relatedResources: [],
                                        memo: Memo(
                                            description: "description"
                                        )
                                    )
                                ],
                                id: "id",
                                relatedResources: [
                                    ResourceList.account(
                                        .init(
                                            resourceType: .account,
                                            name: "name",
                                            patient: Optional(Patient(
                                                resourceType: .patient,
                                                name: "name",
                                                scripts: [],
                                                id: "id",
                                                relatedResources: [],
                                                memo: Memo(
                                                    description: "description"
                                                )
                                            )),
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description"
                                            )
                                        )
                                    ),
                                    ResourceList.account(
                                        .init(
                                            resourceType: .account,
                                            name: "name",
                                            patient: Optional(Patient(
                                                resourceType: .patient,
                                                name: "name",
                                                scripts: [],
                                                id: "id",
                                                relatedResources: [],
                                                memo: Memo(
                                                    description: "description"
                                                )
                                            )),
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description"
                                            )
                                        )
                                    )
                                ],
                                memo: Memo(
                                    description: "description"
                                )
                            )),
                            practitioner: Optional(Practitioner(
                                resourceType: .practitioner,
                                name: "name",
                                id: "id",
                                relatedResources: [
                                    ResourceList.account(
                                        .init(
                                            resourceType: .account,
                                            name: "name",
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description"
                                            )
                                        )
                                    ),
                                    ResourceList.account(
                                        .init(
                                            resourceType: .account,
                                            name: "name",
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description"
                                            )
                                        )
                                    )
                                ],
                                memo: Memo(
                                    description: "description"
                                )
                            )),
                            id: "id",
                            relatedResources: [
                                ResourceList.account(
                                    .init(
                                        resourceType: .account,
                                        name: "name",
                                        patient: Optional(Patient(
                                            resourceType: .patient,
                                            name: "name",
                                            scripts: [],
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description"
                                            )
                                        )),
                                        practitioner: Optional(Practitioner(
                                            resourceType: .practitioner,
                                            name: "name",
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description"
                                            )
                                        )),
                                        id: "id",
                                        relatedResources: [],
                                        memo: Memo(
                                            description: "description"
                                        )
                                    )
                                ),
                                ResourceList.account(
                                    .init(
                                        resourceType: .account,
                                        name: "name",
                                        patient: Optional(Patient(
                                            resourceType: .patient,
                                            name: "name",
                                            scripts: [],
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description"
                                            )
                                        )),
                                        practitioner: Optional(Practitioner(
                                            resourceType: .practitioner,
                                            name: "name",
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description"
                                            )
                                        )),
                                        id: "id",
                                        relatedResources: [],
                                        memo: Memo(
                                            description: "description"
                                        )
                                    )
                                )
                            ],
                            memo: Memo(
                                description: "description",
                                account: Optional(Account(
                                    resourceType: .account,
                                    name: "name",
                                    id: "id",
                                    relatedResources: [],
                                    memo: Memo(
                                        description: "description",
                                        account: Optional(Account(
                                            resourceType: .account,
                                            name: "name",
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description"
                                            )
                                        ))
                                    )
                                ))
                            )
                        )
                    )
                ],
                memo: Memo(
                    description: "description",
                    account: Optional(Account(
                        resourceType: .account,
                        name: "name",
                        patient: Optional(Patient(
                            resourceType: .patient,
                            name: "name",
                            scripts: [],
                            id: "id",
                            relatedResources: [],
                            memo: Memo(
                                description: "description",
                                account: Optional(Account(
                                    resourceType: .account,
                                    name: "name",
                                    id: "id",
                                    relatedResources: [],
                                    memo: Memo(
                                        description: "description"
                                    )
                                ))
                            )
                        )),
                        practitioner: Optional(Practitioner(
                            resourceType: .practitioner,
                            name: "name",
                            id: "id",
                            relatedResources: [],
                            memo: Memo(
                                description: "description",
                                account: Optional(Account(
                                    resourceType: .account,
                                    name: "name",
                                    id: "id",
                                    relatedResources: [],
                                    memo: Memo(
                                        description: "description"
                                    )
                                ))
                            )
                        )),
                        id: "id",
                        relatedResources: [
                            ResourceList.account(
                                .init(
                                    resourceType: .account,
                                    name: "name",
                                    id: "id",
                                    relatedResources: [],
                                    memo: Memo(
                                        description: "description",
                                        account: Optional(Account(
                                            resourceType: .account,
                                            name: "name",
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description"
                                            )
                                        ))
                                    )
                                )
                            ),
                            ResourceList.account(
                                .init(
                                    resourceType: .account,
                                    name: "name",
                                    id: "id",
                                    relatedResources: [],
                                    memo: Memo(
                                        description: "description",
                                        account: Optional(Account(
                                            resourceType: .account,
                                            name: "name",
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description"
                                            )
                                        ))
                                    )
                                )
                            )
                        ],
                        memo: Memo(
                            description: "description",
                            account: Optional(Account(
                                resourceType: .account,
                                name: "name",
                                id: "id",
                                relatedResources: [],
                                memo: Memo(
                                    description: "description"
                                )
                            ))
                        )
                    ))
                )
            )),
            practitioner: Optional(Practitioner(
                resourceType: .practitioner,
                name: "name",
                id: "id",
                relatedResources: [
                    ResourceList.account(
                        .init(
                            resourceType: .account,
                            name: "name",
                            patient: Optional(Patient(
                                resourceType: .patient,
                                name: "name",
                                scripts: [
                                    Script(
                                        resourceType: .script,
                                        name: "name",
                                        id: "id",
                                        relatedResources: [],
                                        memo: Memo(
                                            description: "description"
                                        )
                                    ),
                                    Script(
                                        resourceType: .script,
                                        name: "name",
                                        id: "id",
                                        relatedResources: [],
                                        memo: Memo(
                                            description: "description"
                                        )
                                    )
                                ],
                                id: "id",
                                relatedResources: [
                                    ResourceList.account(
                                        .init(
                                            resourceType: .account,
                                            name: "name",
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description"
                                            )
                                        )
                                    ),
                                    ResourceList.account(
                                        .init(
                                            resourceType: .account,
                                            name: "name",
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description"
                                            )
                                        )
                                    )
                                ],
                                memo: Memo(
                                    description: "description"
                                )
                            )),
                            practitioner: Optional(Practitioner(
                                resourceType: .practitioner,
                                name: "name",
                                id: "id",
                                relatedResources: [
                                    ResourceList.account(
                                        .init(
                                            resourceType: .account,
                                            name: "name",
                                            practitioner: Optional(Practitioner(
                                                resourceType: .practitioner,
                                                name: "name",
                                                id: "id",
                                                relatedResources: [],
                                                memo: Memo(
                                                    description: "description"
                                                )
                                            )),
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description"
                                            )
                                        )
                                    ),
                                    ResourceList.account(
                                        .init(
                                            resourceType: .account,
                                            name: "name",
                                            practitioner: Optional(Practitioner(
                                                resourceType: .practitioner,
                                                name: "name",
                                                id: "id",
                                                relatedResources: [],
                                                memo: Memo(
                                                    description: "description"
                                                )
                                            )),
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description"
                                            )
                                        )
                                    )
                                ],
                                memo: Memo(
                                    description: "description"
                                )
                            )),
                            id: "id",
                            relatedResources: [
                                ResourceList.account(
                                    .init(
                                        resourceType: .account,
                                        name: "name",
                                        patient: Optional(Patient(
                                            resourceType: .patient,
                                            name: "name",
                                            scripts: [],
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description"
                                            )
                                        )),
                                        practitioner: Optional(Practitioner(
                                            resourceType: .practitioner,
                                            name: "name",
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description"
                                            )
                                        )),
                                        id: "id",
                                        relatedResources: [],
                                        memo: Memo(
                                            description: "description"
                                        )
                                    )
                                ),
                                ResourceList.account(
                                    .init(
                                        resourceType: .account,
                                        name: "name",
                                        patient: Optional(Patient(
                                            resourceType: .patient,
                                            name: "name",
                                            scripts: [],
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description"
                                            )
                                        )),
                                        practitioner: Optional(Practitioner(
                                            resourceType: .practitioner,
                                            name: "name",
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description"
                                            )
                                        )),
                                        id: "id",
                                        relatedResources: [],
                                        memo: Memo(
                                            description: "description"
                                        )
                                    )
                                )
                            ],
                            memo: Memo(
                                description: "description",
                                account: Optional(Account(
                                    resourceType: .account,
                                    name: "name",
                                    id: "id",
                                    relatedResources: [],
                                    memo: Memo(
                                        description: "description",
                                        account: Optional(Account(
                                            resourceType: .account,
                                            name: "name",
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description"
                                            )
                                        ))
                                    )
                                ))
                            )
                        )
                    ),
                    ResourceList.account(
                        .init(
                            resourceType: .account,
                            name: "name",
                            patient: Optional(Patient(
                                resourceType: .patient,
                                name: "name",
                                scripts: [
                                    Script(
                                        resourceType: .script,
                                        name: "name",
                                        id: "id",
                                        relatedResources: [],
                                        memo: Memo(
                                            description: "description"
                                        )
                                    ),
                                    Script(
                                        resourceType: .script,
                                        name: "name",
                                        id: "id",
                                        relatedResources: [],
                                        memo: Memo(
                                            description: "description"
                                        )
                                    )
                                ],
                                id: "id",
                                relatedResources: [
                                    ResourceList.account(
                                        .init(
                                            resourceType: .account,
                                            name: "name",
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description"
                                            )
                                        )
                                    ),
                                    ResourceList.account(
                                        .init(
                                            resourceType: .account,
                                            name: "name",
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description"
                                            )
                                        )
                                    )
                                ],
                                memo: Memo(
                                    description: "description"
                                )
                            )),
                            practitioner: Optional(Practitioner(
                                resourceType: .practitioner,
                                name: "name",
                                id: "id",
                                relatedResources: [
                                    ResourceList.account(
                                        .init(
                                            resourceType: .account,
                                            name: "name",
                                            practitioner: Optional(Practitioner(
                                                resourceType: .practitioner,
                                                name: "name",
                                                id: "id",
                                                relatedResources: [],
                                                memo: Memo(
                                                    description: "description"
                                                )
                                            )),
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description"
                                            )
                                        )
                                    ),
                                    ResourceList.account(
                                        .init(
                                            resourceType: .account,
                                            name: "name",
                                            practitioner: Optional(Practitioner(
                                                resourceType: .practitioner,
                                                name: "name",
                                                id: "id",
                                                relatedResources: [],
                                                memo: Memo(
                                                    description: "description"
                                                )
                                            )),
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description"
                                            )
                                        )
                                    )
                                ],
                                memo: Memo(
                                    description: "description"
                                )
                            )),
                            id: "id",
                            relatedResources: [
                                ResourceList.account(
                                    .init(
                                        resourceType: .account,
                                        name: "name",
                                        patient: Optional(Patient(
                                            resourceType: .patient,
                                            name: "name",
                                            scripts: [],
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description"
                                            )
                                        )),
                                        practitioner: Optional(Practitioner(
                                            resourceType: .practitioner,
                                            name: "name",
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description"
                                            )
                                        )),
                                        id: "id",
                                        relatedResources: [],
                                        memo: Memo(
                                            description: "description"
                                        )
                                    )
                                ),
                                ResourceList.account(
                                    .init(
                                        resourceType: .account,
                                        name: "name",
                                        patient: Optional(Patient(
                                            resourceType: .patient,
                                            name: "name",
                                            scripts: [],
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description"
                                            )
                                        )),
                                        practitioner: Optional(Practitioner(
                                            resourceType: .practitioner,
                                            name: "name",
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description"
                                            )
                                        )),
                                        id: "id",
                                        relatedResources: [],
                                        memo: Memo(
                                            description: "description"
                                        )
                                    )
                                )
                            ],
                            memo: Memo(
                                description: "description",
                                account: Optional(Account(
                                    resourceType: .account,
                                    name: "name",
                                    id: "id",
                                    relatedResources: [],
                                    memo: Memo(
                                        description: "description",
                                        account: Optional(Account(
                                            resourceType: .account,
                                            name: "name",
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description"
                                            )
                                        ))
                                    )
                                ))
                            )
                        )
                    )
                ],
                memo: Memo(
                    description: "description",
                    account: Optional(Account(
                        resourceType: .account,
                        name: "name",
                        patient: Optional(Patient(
                            resourceType: .patient,
                            name: "name",
                            scripts: [],
                            id: "id",
                            relatedResources: [],
                            memo: Memo(
                                description: "description",
                                account: Optional(Account(
                                    resourceType: .account,
                                    name: "name",
                                    id: "id",
                                    relatedResources: [],
                                    memo: Memo(
                                        description: "description"
                                    )
                                ))
                            )
                        )),
                        practitioner: Optional(Practitioner(
                            resourceType: .practitioner,
                            name: "name",
                            id: "id",
                            relatedResources: [],
                            memo: Memo(
                                description: "description",
                                account: Optional(Account(
                                    resourceType: .account,
                                    name: "name",
                                    id: "id",
                                    relatedResources: [],
                                    memo: Memo(
                                        description: "description"
                                    )
                                ))
                            )
                        )),
                        id: "id",
                        relatedResources: [
                            ResourceList.account(
                                .init(
                                    resourceType: .account,
                                    name: "name",
                                    id: "id",
                                    relatedResources: [],
                                    memo: Memo(
                                        description: "description",
                                        account: Optional(Account(
                                            resourceType: .account,
                                            name: "name",
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description"
                                            )
                                        ))
                                    )
                                )
                            ),
                            ResourceList.account(
                                .init(
                                    resourceType: .account,
                                    name: "name",
                                    id: "id",
                                    relatedResources: [],
                                    memo: Memo(
                                        description: "description",
                                        account: Optional(Account(
                                            resourceType: .account,
                                            name: "name",
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description"
                                            )
                                        ))
                                    )
                                )
                            )
                        ],
                        memo: Memo(
                            description: "description",
                            account: Optional(Account(
                                resourceType: .account,
                                name: "name",
                                id: "id",
                                relatedResources: [],
                                memo: Memo(
                                    description: "description"
                                )
                            ))
                        )
                    ))
                )
            )),
            id: "id",
            relatedResources: [
                ResourceList.account(
                    .init(
                        resourceType: .account,
                        name: "name",
                        patient: Optional(Patient(
                            resourceType: .patient,
                            name: "name",
                            scripts: [
                                Script(
                                    resourceType: .script,
                                    name: "name",
                                    id: "id",
                                    relatedResources: [
                                        ResourceList.account(
                                            .init(
                                                resourceType: .account,
                                                name: "name",
                                                id: "id",
                                                relatedResources: [],
                                                memo: Memo(
                                                    description: "description"
                                                )
                                            )
                                        ),
                                        ResourceList.account(
                                            .init(
                                                resourceType: .account,
                                                name: "name",
                                                id: "id",
                                                relatedResources: [],
                                                memo: Memo(
                                                    description: "description"
                                                )
                                            )
                                        )
                                    ],
                                    memo: Memo(
                                        description: "description"
                                    )
                                ),
                                Script(
                                    resourceType: .script,
                                    name: "name",
                                    id: "id",
                                    relatedResources: [
                                        ResourceList.account(
                                            .init(
                                                resourceType: .account,
                                                name: "name",
                                                id: "id",
                                                relatedResources: [],
                                                memo: Memo(
                                                    description: "description"
                                                )
                                            )
                                        ),
                                        ResourceList.account(
                                            .init(
                                                resourceType: .account,
                                                name: "name",
                                                id: "id",
                                                relatedResources: [],
                                                memo: Memo(
                                                    description: "description"
                                                )
                                            )
                                        )
                                    ],
                                    memo: Memo(
                                        description: "description"
                                    )
                                )
                            ],
                            id: "id",
                            relatedResources: [
                                ResourceList.account(
                                    .init(
                                        resourceType: .account,
                                        name: "name",
                                        patient: Optional(Patient(
                                            resourceType: .patient,
                                            name: "name",
                                            scripts: [],
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description"
                                            )
                                        )),
                                        practitioner: Optional(Practitioner(
                                            resourceType: .practitioner,
                                            name: "name",
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description"
                                            )
                                        )),
                                        id: "id",
                                        relatedResources: [],
                                        memo: Memo(
                                            description: "description"
                                        )
                                    )
                                ),
                                ResourceList.account(
                                    .init(
                                        resourceType: .account,
                                        name: "name",
                                        patient: Optional(Patient(
                                            resourceType: .patient,
                                            name: "name",
                                            scripts: [],
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description"
                                            )
                                        )),
                                        practitioner: Optional(Practitioner(
                                            resourceType: .practitioner,
                                            name: "name",
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description"
                                            )
                                        )),
                                        id: "id",
                                        relatedResources: [],
                                        memo: Memo(
                                            description: "description"
                                        )
                                    )
                                )
                            ],
                            memo: Memo(
                                description: "description",
                                account: Optional(Account(
                                    resourceType: .account,
                                    name: "name",
                                    id: "id",
                                    relatedResources: [],
                                    memo: Memo(
                                        description: "description",
                                        account: Optional(Account(
                                            resourceType: .account,
                                            name: "name",
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description"
                                            )
                                        ))
                                    )
                                ))
                            )
                        )),
                        practitioner: Optional(Practitioner(
                            resourceType: .practitioner,
                            name: "name",
                            id: "id",
                            relatedResources: [
                                ResourceList.account(
                                    .init(
                                        resourceType: .account,
                                        name: "name",
                                        patient: Optional(Patient(
                                            resourceType: .patient,
                                            name: "name",
                                            scripts: [],
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description"
                                            )
                                        )),
                                        practitioner: Optional(Practitioner(
                                            resourceType: .practitioner,
                                            name: "name",
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description"
                                            )
                                        )),
                                        id: "id",
                                        relatedResources: [],
                                        memo: Memo(
                                            description: "description"
                                        )
                                    )
                                ),
                                ResourceList.account(
                                    .init(
                                        resourceType: .account,
                                        name: "name",
                                        patient: Optional(Patient(
                                            resourceType: .patient,
                                            name: "name",
                                            scripts: [],
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description"
                                            )
                                        )),
                                        practitioner: Optional(Practitioner(
                                            resourceType: .practitioner,
                                            name: "name",
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description"
                                            )
                                        )),
                                        id: "id",
                                        relatedResources: [],
                                        memo: Memo(
                                            description: "description"
                                        )
                                    )
                                )
                            ],
                            memo: Memo(
                                description: "description",
                                account: Optional(Account(
                                    resourceType: .account,
                                    name: "name",
                                    id: "id",
                                    relatedResources: [],
                                    memo: Memo(
                                        description: "description",
                                        account: Optional(Account(
                                            resourceType: .account,
                                            name: "name",
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description"
                                            )
                                        ))
                                    )
                                ))
                            )
                        )),
                        id: "id",
                        relatedResources: [
                            ResourceList.account(
                                .init(
                                    resourceType: .account,
                                    name: "name",
                                    patient: Optional(Patient(
                                        resourceType: .patient,
                                        name: "name",
                                        scripts: [
                                            Script(
                                                resourceType: .script,
                                                name: "name",
                                                id: "id",
                                                relatedResources: [],
                                                memo: Memo(
                                                    description: "description"
                                                )
                                            ),
                                            Script(
                                                resourceType: .script,
                                                name: "name",
                                                id: "id",
                                                relatedResources: [],
                                                memo: Memo(
                                                    description: "description"
                                                )
                                            )
                                        ],
                                        id: "id",
                                        relatedResources: [],
                                        memo: Memo(
                                            description: "description"
                                        )
                                    )),
                                    practitioner: Optional(Practitioner(
                                        resourceType: .practitioner,
                                        name: "name",
                                        id: "id",
                                        relatedResources: [],
                                        memo: Memo(
                                            description: "description"
                                        )
                                    )),
                                    id: "id",
                                    relatedResources: [],
                                    memo: Memo(
                                        description: "description",
                                        account: Optional(Account(
                                            resourceType: .account,
                                            name: "name",
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description",
                                                account: Optional(Account(
                                                    resourceType: .account,
                                                    name: "name",
                                                    id: "id",
                                                    relatedResources: [],
                                                    memo: Memo(
                                                        description: "description"
                                                    )
                                                ))
                                            )
                                        ))
                                    )
                                )
                            ),
                            ResourceList.account(
                                .init(
                                    resourceType: .account,
                                    name: "name",
                                    patient: Optional(Patient(
                                        resourceType: .patient,
                                        name: "name",
                                        scripts: [
                                            Script(
                                                resourceType: .script,
                                                name: "name",
                                                id: "id",
                                                relatedResources: [],
                                                memo: Memo(
                                                    description: "description"
                                                )
                                            ),
                                            Script(
                                                resourceType: .script,
                                                name: "name",
                                                id: "id",
                                                relatedResources: [],
                                                memo: Memo(
                                                    description: "description"
                                                )
                                            )
                                        ],
                                        id: "id",
                                        relatedResources: [],
                                        memo: Memo(
                                            description: "description"
                                        )
                                    )),
                                    practitioner: Optional(Practitioner(
                                        resourceType: .practitioner,
                                        name: "name",
                                        id: "id",
                                        relatedResources: [],
                                        memo: Memo(
                                            description: "description"
                                        )
                                    )),
                                    id: "id",
                                    relatedResources: [],
                                    memo: Memo(
                                        description: "description",
                                        account: Optional(Account(
                                            resourceType: .account,
                                            name: "name",
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description",
                                                account: Optional(Account(
                                                    resourceType: .account,
                                                    name: "name",
                                                    id: "id",
                                                    relatedResources: [],
                                                    memo: Memo(
                                                        description: "description"
                                                    )
                                                ))
                                            )
                                        ))
                                    )
                                )
                            )
                        ],
                        memo: Memo(
                            description: "description",
                            account: Optional(Account(
                                resourceType: .account,
                                name: "name",
                                patient: Optional(Patient(
                                    resourceType: .patient,
                                    name: "name",
                                    scripts: [],
                                    id: "id",
                                    relatedResources: [],
                                    memo: Memo(
                                        description: "description",
                                        account: Optional(Account(
                                            resourceType: .account,
                                            name: "name",
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description"
                                            )
                                        ))
                                    )
                                )),
                                practitioner: Optional(Practitioner(
                                    resourceType: .practitioner,
                                    name: "name",
                                    id: "id",
                                    relatedResources: [],
                                    memo: Memo(
                                        description: "description",
                                        account: Optional(Account(
                                            resourceType: .account,
                                            name: "name",
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description"
                                            )
                                        ))
                                    )
                                )),
                                id: "id",
                                relatedResources: [
                                    ResourceList.account(
                                        .init(
                                            resourceType: .account,
                                            name: "name",
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description",
                                                account: Optional(Account(
                                                    resourceType: .account,
                                                    name: "name",
                                                    id: "id",
                                                    relatedResources: [],
                                                    memo: Memo(
                                                        description: "description"
                                                    )
                                                ))
                                            )
                                        )
                                    ),
                                    ResourceList.account(
                                        .init(
                                            resourceType: .account,
                                            name: "name",
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description",
                                                account: Optional(Account(
                                                    resourceType: .account,
                                                    name: "name",
                                                    id: "id",
                                                    relatedResources: [],
                                                    memo: Memo(
                                                        description: "description"
                                                    )
                                                ))
                                            )
                                        )
                                    )
                                ],
                                memo: Memo(
                                    description: "description",
                                    account: Optional(Account(
                                        resourceType: .account,
                                        name: "name",
                                        id: "id",
                                        relatedResources: [],
                                        memo: Memo(
                                            description: "description"
                                        )
                                    ))
                                )
                            ))
                        )
                    )
                ),
                ResourceList.account(
                    .init(
                        resourceType: .account,
                        name: "name",
                        patient: Optional(Patient(
                            resourceType: .patient,
                            name: "name",
                            scripts: [
                                Script(
                                    resourceType: .script,
                                    name: "name",
                                    id: "id",
                                    relatedResources: [
                                        ResourceList.account(
                                            .init(
                                                resourceType: .account,
                                                name: "name",
                                                id: "id",
                                                relatedResources: [],
                                                memo: Memo(
                                                    description: "description"
                                                )
                                            )
                                        ),
                                        ResourceList.account(
                                            .init(
                                                resourceType: .account,
                                                name: "name",
                                                id: "id",
                                                relatedResources: [],
                                                memo: Memo(
                                                    description: "description"
                                                )
                                            )
                                        )
                                    ],
                                    memo: Memo(
                                        description: "description"
                                    )
                                ),
                                Script(
                                    resourceType: .script,
                                    name: "name",
                                    id: "id",
                                    relatedResources: [
                                        ResourceList.account(
                                            .init(
                                                resourceType: .account,
                                                name: "name",
                                                id: "id",
                                                relatedResources: [],
                                                memo: Memo(
                                                    description: "description"
                                                )
                                            )
                                        ),
                                        ResourceList.account(
                                            .init(
                                                resourceType: .account,
                                                name: "name",
                                                id: "id",
                                                relatedResources: [],
                                                memo: Memo(
                                                    description: "description"
                                                )
                                            )
                                        )
                                    ],
                                    memo: Memo(
                                        description: "description"
                                    )
                                )
                            ],
                            id: "id",
                            relatedResources: [
                                ResourceList.account(
                                    .init(
                                        resourceType: .account,
                                        name: "name",
                                        patient: Optional(Patient(
                                            resourceType: .patient,
                                            name: "name",
                                            scripts: [],
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description"
                                            )
                                        )),
                                        practitioner: Optional(Practitioner(
                                            resourceType: .practitioner,
                                            name: "name",
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description"
                                            )
                                        )),
                                        id: "id",
                                        relatedResources: [],
                                        memo: Memo(
                                            description: "description"
                                        )
                                    )
                                ),
                                ResourceList.account(
                                    .init(
                                        resourceType: .account,
                                        name: "name",
                                        patient: Optional(Patient(
                                            resourceType: .patient,
                                            name: "name",
                                            scripts: [],
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description"
                                            )
                                        )),
                                        practitioner: Optional(Practitioner(
                                            resourceType: .practitioner,
                                            name: "name",
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description"
                                            )
                                        )),
                                        id: "id",
                                        relatedResources: [],
                                        memo: Memo(
                                            description: "description"
                                        )
                                    )
                                )
                            ],
                            memo: Memo(
                                description: "description",
                                account: Optional(Account(
                                    resourceType: .account,
                                    name: "name",
                                    id: "id",
                                    relatedResources: [],
                                    memo: Memo(
                                        description: "description",
                                        account: Optional(Account(
                                            resourceType: .account,
                                            name: "name",
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description"
                                            )
                                        ))
                                    )
                                ))
                            )
                        )),
                        practitioner: Optional(Practitioner(
                            resourceType: .practitioner,
                            name: "name",
                            id: "id",
                            relatedResources: [
                                ResourceList.account(
                                    .init(
                                        resourceType: .account,
                                        name: "name",
                                        patient: Optional(Patient(
                                            resourceType: .patient,
                                            name: "name",
                                            scripts: [],
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description"
                                            )
                                        )),
                                        practitioner: Optional(Practitioner(
                                            resourceType: .practitioner,
                                            name: "name",
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description"
                                            )
                                        )),
                                        id: "id",
                                        relatedResources: [],
                                        memo: Memo(
                                            description: "description"
                                        )
                                    )
                                ),
                                ResourceList.account(
                                    .init(
                                        resourceType: .account,
                                        name: "name",
                                        patient: Optional(Patient(
                                            resourceType: .patient,
                                            name: "name",
                                            scripts: [],
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description"
                                            )
                                        )),
                                        practitioner: Optional(Practitioner(
                                            resourceType: .practitioner,
                                            name: "name",
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description"
                                            )
                                        )),
                                        id: "id",
                                        relatedResources: [],
                                        memo: Memo(
                                            description: "description"
                                        )
                                    )
                                )
                            ],
                            memo: Memo(
                                description: "description",
                                account: Optional(Account(
                                    resourceType: .account,
                                    name: "name",
                                    id: "id",
                                    relatedResources: [],
                                    memo: Memo(
                                        description: "description",
                                        account: Optional(Account(
                                            resourceType: .account,
                                            name: "name",
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description"
                                            )
                                        ))
                                    )
                                ))
                            )
                        )),
                        id: "id",
                        relatedResources: [
                            ResourceList.account(
                                .init(
                                    resourceType: .account,
                                    name: "name",
                                    patient: Optional(Patient(
                                        resourceType: .patient,
                                        name: "name",
                                        scripts: [
                                            Script(
                                                resourceType: .script,
                                                name: "name",
                                                id: "id",
                                                relatedResources: [],
                                                memo: Memo(
                                                    description: "description"
                                                )
                                            ),
                                            Script(
                                                resourceType: .script,
                                                name: "name",
                                                id: "id",
                                                relatedResources: [],
                                                memo: Memo(
                                                    description: "description"
                                                )
                                            )
                                        ],
                                        id: "id",
                                        relatedResources: [],
                                        memo: Memo(
                                            description: "description"
                                        )
                                    )),
                                    practitioner: Optional(Practitioner(
                                        resourceType: .practitioner,
                                        name: "name",
                                        id: "id",
                                        relatedResources: [],
                                        memo: Memo(
                                            description: "description"
                                        )
                                    )),
                                    id: "id",
                                    relatedResources: [],
                                    memo: Memo(
                                        description: "description",
                                        account: Optional(Account(
                                            resourceType: .account,
                                            name: "name",
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description",
                                                account: Optional(Account(
                                                    resourceType: .account,
                                                    name: "name",
                                                    id: "id",
                                                    relatedResources: [],
                                                    memo: Memo(
                                                        description: "description"
                                                    )
                                                ))
                                            )
                                        ))
                                    )
                                )
                            ),
                            ResourceList.account(
                                .init(
                                    resourceType: .account,
                                    name: "name",
                                    patient: Optional(Patient(
                                        resourceType: .patient,
                                        name: "name",
                                        scripts: [
                                            Script(
                                                resourceType: .script,
                                                name: "name",
                                                id: "id",
                                                relatedResources: [],
                                                memo: Memo(
                                                    description: "description"
                                                )
                                            ),
                                            Script(
                                                resourceType: .script,
                                                name: "name",
                                                id: "id",
                                                relatedResources: [],
                                                memo: Memo(
                                                    description: "description"
                                                )
                                            )
                                        ],
                                        id: "id",
                                        relatedResources: [],
                                        memo: Memo(
                                            description: "description"
                                        )
                                    )),
                                    practitioner: Optional(Practitioner(
                                        resourceType: .practitioner,
                                        name: "name",
                                        id: "id",
                                        relatedResources: [],
                                        memo: Memo(
                                            description: "description"
                                        )
                                    )),
                                    id: "id",
                                    relatedResources: [],
                                    memo: Memo(
                                        description: "description",
                                        account: Optional(Account(
                                            resourceType: .account,
                                            name: "name",
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description",
                                                account: Optional(Account(
                                                    resourceType: .account,
                                                    name: "name",
                                                    id: "id",
                                                    relatedResources: [],
                                                    memo: Memo(
                                                        description: "description"
                                                    )
                                                ))
                                            )
                                        ))
                                    )
                                )
                            )
                        ],
                        memo: Memo(
                            description: "description",
                            account: Optional(Account(
                                resourceType: .account,
                                name: "name",
                                patient: Optional(Patient(
                                    resourceType: .patient,
                                    name: "name",
                                    scripts: [],
                                    id: "id",
                                    relatedResources: [],
                                    memo: Memo(
                                        description: "description",
                                        account: Optional(Account(
                                            resourceType: .account,
                                            name: "name",
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description"
                                            )
                                        ))
                                    )
                                )),
                                practitioner: Optional(Practitioner(
                                    resourceType: .practitioner,
                                    name: "name",
                                    id: "id",
                                    relatedResources: [],
                                    memo: Memo(
                                        description: "description",
                                        account: Optional(Account(
                                            resourceType: .account,
                                            name: "name",
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description"
                                            )
                                        ))
                                    )
                                )),
                                id: "id",
                                relatedResources: [
                                    ResourceList.account(
                                        .init(
                                            resourceType: .account,
                                            name: "name",
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description",
                                                account: Optional(Account(
                                                    resourceType: .account,
                                                    name: "name",
                                                    id: "id",
                                                    relatedResources: [],
                                                    memo: Memo(
                                                        description: "description"
                                                    )
                                                ))
                                            )
                                        )
                                    ),
                                    ResourceList.account(
                                        .init(
                                            resourceType: .account,
                                            name: "name",
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description",
                                                account: Optional(Account(
                                                    resourceType: .account,
                                                    name: "name",
                                                    id: "id",
                                                    relatedResources: [],
                                                    memo: Memo(
                                                        description: "description"
                                                    )
                                                ))
                                            )
                                        )
                                    )
                                ],
                                memo: Memo(
                                    description: "description",
                                    account: Optional(Account(
                                        resourceType: .account,
                                        name: "name",
                                        id: "id",
                                        relatedResources: [],
                                        memo: Memo(
                                            description: "description"
                                        )
                                    ))
                                )
                            ))
                        )
                    )
                )
            ],
            memo: Memo(
                description: "description",
                account: Optional(Account(
                    resourceType: .account,
                    name: "name",
                    patient: Optional(Patient(
                        resourceType: .patient,
                        name: "name",
                        scripts: [
                            Script(
                                resourceType: .script,
                                name: "name",
                                id: "id",
                                relatedResources: [],
                                memo: Memo(
                                    description: "description",
                                    account: Optional(Account(
                                        resourceType: .account,
                                        name: "name",
                                        id: "id",
                                        relatedResources: [],
                                        memo: Memo(
                                            description: "description"
                                        )
                                    ))
                                )
                            ),
                            Script(
                                resourceType: .script,
                                name: "name",
                                id: "id",
                                relatedResources: [],
                                memo: Memo(
                                    description: "description",
                                    account: Optional(Account(
                                        resourceType: .account,
                                        name: "name",
                                        id: "id",
                                        relatedResources: [],
                                        memo: Memo(
                                            description: "description"
                                        )
                                    ))
                                )
                            )
                        ],
                        id: "id",
                        relatedResources: [
                            ResourceList.account(
                                .init(
                                    resourceType: .account,
                                    name: "name",
                                    id: "id",
                                    relatedResources: [],
                                    memo: Memo(
                                        description: "description",
                                        account: Optional(Account(
                                            resourceType: .account,
                                            name: "name",
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description"
                                            )
                                        ))
                                    )
                                )
                            ),
                            ResourceList.account(
                                .init(
                                    resourceType: .account,
                                    name: "name",
                                    id: "id",
                                    relatedResources: [],
                                    memo: Memo(
                                        description: "description",
                                        account: Optional(Account(
                                            resourceType: .account,
                                            name: "name",
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description"
                                            )
                                        ))
                                    )
                                )
                            )
                        ],
                        memo: Memo(
                            description: "description",
                            account: Optional(Account(
                                resourceType: .account,
                                name: "name",
                                id: "id",
                                relatedResources: [],
                                memo: Memo(
                                    description: "description"
                                )
                            ))
                        )
                    )),
                    practitioner: Optional(Practitioner(
                        resourceType: .practitioner,
                        name: "name",
                        id: "id",
                        relatedResources: [
                            ResourceList.account(
                                .init(
                                    resourceType: .account,
                                    name: "name",
                                    id: "id",
                                    relatedResources: [],
                                    memo: Memo(
                                        description: "description",
                                        account: Optional(Account(
                                            resourceType: .account,
                                            name: "name",
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description"
                                            )
                                        ))
                                    )
                                )
                            ),
                            ResourceList.account(
                                .init(
                                    resourceType: .account,
                                    name: "name",
                                    id: "id",
                                    relatedResources: [],
                                    memo: Memo(
                                        description: "description",
                                        account: Optional(Account(
                                            resourceType: .account,
                                            name: "name",
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description"
                                            )
                                        ))
                                    )
                                )
                            )
                        ],
                        memo: Memo(
                            description: "description",
                            account: Optional(Account(
                                resourceType: .account,
                                name: "name",
                                id: "id",
                                relatedResources: [],
                                memo: Memo(
                                    description: "description"
                                )
                            ))
                        )
                    )),
                    id: "id",
                    relatedResources: [
                        ResourceList.account(
                            .init(
                                resourceType: .account,
                                name: "name",
                                patient: Optional(Patient(
                                    resourceType: .patient,
                                    name: "name",
                                    scripts: [],
                                    id: "id",
                                    relatedResources: [],
                                    memo: Memo(
                                        description: "description",
                                        account: Optional(Account(
                                            resourceType: .account,
                                            name: "name",
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description"
                                            )
                                        ))
                                    )
                                )),
                                practitioner: Optional(Practitioner(
                                    resourceType: .practitioner,
                                    name: "name",
                                    id: "id",
                                    relatedResources: [],
                                    memo: Memo(
                                        description: "description",
                                        account: Optional(Account(
                                            resourceType: .account,
                                            name: "name",
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description"
                                            )
                                        ))
                                    )
                                )),
                                id: "id",
                                relatedResources: [
                                    ResourceList.account(
                                        .init(
                                            resourceType: .account,
                                            name: "name",
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description",
                                                account: Optional(Account(
                                                    resourceType: .account,
                                                    name: "name",
                                                    id: "id",
                                                    relatedResources: [],
                                                    memo: Memo(
                                                        description: "description"
                                                    )
                                                ))
                                            )
                                        )
                                    ),
                                    ResourceList.account(
                                        .init(
                                            resourceType: .account,
                                            name: "name",
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description",
                                                account: Optional(Account(
                                                    resourceType: .account,
                                                    name: "name",
                                                    id: "id",
                                                    relatedResources: [],
                                                    memo: Memo(
                                                        description: "description"
                                                    )
                                                ))
                                            )
                                        )
                                    )
                                ],
                                memo: Memo(
                                    description: "description",
                                    account: Optional(Account(
                                        resourceType: .account,
                                        name: "name",
                                        id: "id",
                                        relatedResources: [],
                                        memo: Memo(
                                            description: "description"
                                        )
                                    ))
                                )
                            )
                        ),
                        ResourceList.account(
                            .init(
                                resourceType: .account,
                                name: "name",
                                patient: Optional(Patient(
                                    resourceType: .patient,
                                    name: "name",
                                    scripts: [],
                                    id: "id",
                                    relatedResources: [],
                                    memo: Memo(
                                        description: "description",
                                        account: Optional(Account(
                                            resourceType: .account,
                                            name: "name",
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description"
                                            )
                                        ))
                                    )
                                )),
                                practitioner: Optional(Practitioner(
                                    resourceType: .practitioner,
                                    name: "name",
                                    id: "id",
                                    relatedResources: [],
                                    memo: Memo(
                                        description: "description",
                                        account: Optional(Account(
                                            resourceType: .account,
                                            name: "name",
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description"
                                            )
                                        ))
                                    )
                                )),
                                id: "id",
                                relatedResources: [
                                    ResourceList.account(
                                        .init(
                                            resourceType: .account,
                                            name: "name",
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description",
                                                account: Optional(Account(
                                                    resourceType: .account,
                                                    name: "name",
                                                    id: "id",
                                                    relatedResources: [],
                                                    memo: Memo(
                                                        description: "description"
                                                    )
                                                ))
                                            )
                                        )
                                    ),
                                    ResourceList.account(
                                        .init(
                                            resourceType: .account,
                                            name: "name",
                                            id: "id",
                                            relatedResources: [],
                                            memo: Memo(
                                                description: "description",
                                                account: Optional(Account(
                                                    resourceType: .account,
                                                    name: "name",
                                                    id: "id",
                                                    relatedResources: [],
                                                    memo: Memo(
                                                        description: "description"
                                                    )
                                                ))
                                            )
                                        )
                                    )
                                ],
                                memo: Memo(
                                    description: "description",
                                    account: Optional(Account(
                                        resourceType: .account,
                                        name: "name",
                                        id: "id",
                                        relatedResources: [],
                                        memo: Memo(
                                            description: "description"
                                        )
                                    ))
                                )
                            )
                        )
                    ],
                    memo: Memo(
                        description: "description",
                        account: Optional(Account(
                            resourceType: .account,
                            name: "name",
                            id: "id",
                            relatedResources: [],
                            memo: Memo(
                                description: "description"
                            )
                        ))
                    )
                ))
            )
        )
        let response = try await client..getAccount(
            accountId: "account_id",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}