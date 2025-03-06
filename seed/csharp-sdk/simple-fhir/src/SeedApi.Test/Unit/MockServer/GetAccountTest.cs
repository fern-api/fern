using global::System.Threading.Tasks;
using NUnit.Framework;
using SeedApi;
using SeedApi.Core;

namespace SeedApi.Test.Unit.MockServer;

[TestFixture]
public class GetAccountTest : BaseMockServerTest
{
    [Test]
    public async global::System.Threading.Tasks.Task MockServerTest()
    {
        const string mockResponse = """
            {
              "id": "id",
              "related_resources": [
                {
                  "id": "id",
                  "related_resources": [
                    {
                      "resource_type": "Account",
                      "name": "name"
                    },
                    {
                      "resource_type": "Account",
                      "name": "name"
                    }
                  ],
                  "memo": {
                    "description": "description",
                    "account": {
                      "resource_type": "Account",
                      "name": "name"
                    }
                  },
                  "resource_type": "Account",
                  "name": "name",
                  "patient": {
                    "id": "id",
                    "related_resources": [],
                    "memo": {
                      "description": "description"
                    },
                    "resource_type": "Patient",
                    "name": "name",
                    "scripts": [
                      {
                        "resource_type": "Script",
                        "name": "name"
                      },
                      {
                        "resource_type": "Script",
                        "name": "name"
                      }
                    ]
                  },
                  "practitioner": {
                    "id": "id",
                    "related_resources": [],
                    "memo": {
                      "description": "description"
                    },
                    "resource_type": "Practitioner",
                    "name": "name"
                  }
                },
                {
                  "id": "id",
                  "related_resources": [
                    {
                      "resource_type": "Account",
                      "name": "name"
                    },
                    {
                      "resource_type": "Account",
                      "name": "name"
                    }
                  ],
                  "memo": {
                    "description": "description",
                    "account": {
                      "resource_type": "Account",
                      "name": "name"
                    }
                  },
                  "resource_type": "Account",
                  "name": "name",
                  "patient": {
                    "id": "id",
                    "related_resources": [],
                    "memo": {
                      "description": "description"
                    },
                    "resource_type": "Patient",
                    "name": "name",
                    "scripts": [
                      {
                        "resource_type": "Script",
                        "name": "name"
                      },
                      {
                        "resource_type": "Script",
                        "name": "name"
                      }
                    ]
                  },
                  "practitioner": {
                    "id": "id",
                    "related_resources": [],
                    "memo": {
                      "description": "description"
                    },
                    "resource_type": "Practitioner",
                    "name": "name"
                  }
                }
              ],
              "memo": {
                "description": "description",
                "account": {
                  "id": "id",
                  "related_resources": [
                    {
                      "resource_type": "Account",
                      "name": "name"
                    },
                    {
                      "resource_type": "Account",
                      "name": "name"
                    }
                  ],
                  "memo": {
                    "description": "description",
                    "account": {
                      "resource_type": "Account",
                      "name": "name"
                    }
                  },
                  "resource_type": "Account",
                  "name": "name",
                  "patient": {
                    "id": "id",
                    "related_resources": [],
                    "memo": {
                      "description": "description"
                    },
                    "resource_type": "Patient",
                    "name": "name",
                    "scripts": [
                      {
                        "resource_type": "Script",
                        "name": "name"
                      },
                      {
                        "resource_type": "Script",
                        "name": "name"
                      }
                    ]
                  },
                  "practitioner": {
                    "id": "id",
                    "related_resources": [],
                    "memo": {
                      "description": "description"
                    },
                    "resource_type": "Practitioner",
                    "name": "name"
                  }
                }
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
                    "resource_type": "Account",
                    "name": "name",
                    "patient": {
                      "resource_type": "Patient",
                      "name": "name",
                      "scripts": []
                    },
                    "practitioner": {
                      "resource_type": "Practitioner",
                      "name": "name"
                    }
                  },
                  {
                    "id": "id",
                    "related_resources": [],
                    "memo": {
                      "description": "description"
                    },
                    "resource_type": "Account",
                    "name": "name",
                    "patient": {
                      "resource_type": "Patient",
                      "name": "name",
                      "scripts": []
                    },
                    "practitioner": {
                      "resource_type": "Practitioner",
                      "name": "name"
                    }
                  }
                ],
                "memo": {
                  "description": "description",
                  "account": {
                    "id": "id",
                    "related_resources": [],
                    "memo": {
                      "description": "description"
                    },
                    "resource_type": "Account",
                    "name": "name",
                    "patient": {
                      "resource_type": "Patient",
                      "name": "name",
                      "scripts": []
                    },
                    "practitioner": {
                      "resource_type": "Practitioner",
                      "name": "name"
                    }
                  }
                },
                "resource_type": "Patient",
                "name": "name",
                "scripts": [
                  {
                    "id": "id",
                    "related_resources": [
                      {
                        "resource_type": "Account",
                        "name": "name"
                      },
                      {
                        "resource_type": "Account",
                        "name": "name"
                      }
                    ],
                    "memo": {
                      "description": "description",
                      "account": {
                        "resource_type": "Account",
                        "name": "name"
                      }
                    },
                    "resource_type": "Script",
                    "name": "name"
                  },
                  {
                    "id": "id",
                    "related_resources": [
                      {
                        "resource_type": "Account",
                        "name": "name"
                      },
                      {
                        "resource_type": "Account",
                        "name": "name"
                      }
                    ],
                    "memo": {
                      "description": "description",
                      "account": {
                        "resource_type": "Account",
                        "name": "name"
                      }
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
                    "resource_type": "Account",
                    "name": "name",
                    "patient": {
                      "resource_type": "Patient",
                      "name": "name",
                      "scripts": []
                    },
                    "practitioner": {
                      "resource_type": "Practitioner",
                      "name": "name"
                    }
                  },
                  {
                    "id": "id",
                    "related_resources": [],
                    "memo": {
                      "description": "description"
                    },
                    "resource_type": "Account",
                    "name": "name",
                    "patient": {
                      "resource_type": "Patient",
                      "name": "name",
                      "scripts": []
                    },
                    "practitioner": {
                      "resource_type": "Practitioner",
                      "name": "name"
                    }
                  }
                ],
                "memo": {
                  "description": "description",
                  "account": {
                    "id": "id",
                    "related_resources": [],
                    "memo": {
                      "description": "description"
                    },
                    "resource_type": "Account",
                    "name": "name",
                    "patient": {
                      "resource_type": "Patient",
                      "name": "name",
                      "scripts": []
                    },
                    "practitioner": {
                      "resource_type": "Practitioner",
                      "name": "name"
                    }
                  }
                },
                "resource_type": "Practitioner",
                "name": "name"
              }
            }
            """;

        Server
            .Given(
                WireMock.RequestBuilders.Request.Create().WithPath("/account/account_id").UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.GetAccountAsync("account_id", RequestOptions);
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<Account>(mockResponse)).UsingPropertiesComparer()
        );
    }
}
