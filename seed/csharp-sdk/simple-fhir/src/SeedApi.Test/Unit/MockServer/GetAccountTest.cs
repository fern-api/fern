using NUnit.Framework;
using SeedApi;
using SeedApi.Core;

namespace SeedApi.Test.Unit.MockServer;

[TestFixture]
public class GetAccountTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string mockResponse = """
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
                  }
                }
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

        var response = await Client.GetAccountAsync("account_id");
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<Account>(mockResponse)).UsingDefaults()
        );
    }
}
