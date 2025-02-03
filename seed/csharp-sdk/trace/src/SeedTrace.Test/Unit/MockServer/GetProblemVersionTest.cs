using System.Threading.Tasks;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedTrace.Core;

namespace SeedTrace.Test.Unit.MockServer;

[TestFixture]
public class GetProblemVersionTest : BaseMockServerTest
{
    [Test]
    public async Task MockServerTest()
    {
        const string mockResponse = """
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
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/problems-v2/problem-info/problemId/version/1")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.V2.V3.Problem.GetProblemVersionAsync(
            "problemId",
            1,
            RequestOptions
        );
        JToken
            .Parse(mockResponse)
            .Should()
            .BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }
}
