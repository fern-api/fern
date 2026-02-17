using NUnit.Framework;
using SeedApi.Test.Utils;

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
                        "related_resources": [
                          {
                            "resource_type": "Account",
                            "name": "name",
                            "id": "id"
                          },
                          {
                            "resource_type": "Account",
                            "name": "name",
                            "id": "id"
                          }
                        ],
                        "memo": {
                          "description": "description",
                          "account": {
                            "resource_type": "Account",
                            "name": "name",
                            "id": "id"
                          }
                        }
                      },
                      {
                        "resource_type": "Account",
                        "name": "name",
                        "id": "id",
                        "related_resources": [
                          {
                            "resource_type": "Account",
                            "name": "name",
                            "id": "id"
                          },
                          {
                            "resource_type": "Account",
                            "name": "name",
                            "id": "id"
                          }
                        ],
                        "memo": {
                          "description": "description",
                          "account": {
                            "resource_type": "Account",
                            "name": "name",
                            "id": "id"
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
                        "related_resources": [
                          {
                            "resource_type": "Account",
                            "name": "name",
                            "id": "id"
                          },
                          {
                            "resource_type": "Account",
                            "name": "name",
                            "id": "id"
                          }
                        ],
                        "memo": {
                          "description": "description",
                          "account": {
                            "resource_type": "Account",
                            "name": "name",
                            "id": "id"
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
                        "id": "id",
                        "related_resources": [
                          {
                            "resource_type": "Account",
                            "name": "name",
                            "id": "id"
                          },
                          {
                            "resource_type": "Account",
                            "name": "name",
                            "id": "id"
                          }
                        ],
                        "memo": {
                          "description": "description",
                          "account": {
                            "resource_type": "Account",
                            "name": "name",
                            "id": "id"
                          }
                        }
                      },
                      {
                        "resource_type": "Account",
                        "name": "name",
                        "id": "id",
                        "related_resources": [
                          {
                            "resource_type": "Account",
                            "name": "name",
                            "id": "id"
                          },
                          {
                            "resource_type": "Account",
                            "name": "name",
                            "id": "id"
                          }
                        ],
                        "memo": {
                          "description": "description",
                          "account": {
                            "resource_type": "Account",
                            "name": "name",
                            "id": "id"
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
                        "related_resources": [
                          {
                            "resource_type": "Account",
                            "name": "name",
                            "id": "id"
                          },
                          {
                            "resource_type": "Account",
                            "name": "name",
                            "id": "id"
                          }
                        ],
                        "memo": {
                          "description": "description",
                          "account": {
                            "resource_type": "Account",
                            "name": "name",
                            "id": "id"
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
                      "scripts": [],
                      "id": "id",
                      "related_resources": [
                        {
                          "resource_type": "Account",
                          "name": "name",
                          "id": "id"
                        },
                        {
                          "resource_type": "Account",
                          "name": "name",
                          "id": "id"
                        }
                      ],
                      "memo": {
                        "description": "description",
                        "account": {
                          "resource_type": "Account",
                          "name": "name",
                          "id": "id"
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
                          "id": "id"
                        },
                        {
                          "resource_type": "Account",
                          "name": "name",
                          "id": "id"
                        }
                      ],
                      "memo": {
                        "description": "description",
                        "account": {
                          "resource_type": "Account",
                          "name": "name",
                          "id": "id"
                        }
                      }
                    },
                    "id": "id",
                    "related_resources": [
                      {
                        "resource_type": "Account",
                        "name": "name",
                        "id": "id"
                      },
                      {
                        "resource_type": "Account",
                        "name": "name",
                        "id": "id"
                      }
                    ],
                    "memo": {
                      "description": "description",
                      "account": {
                        "resource_type": "Account",
                        "name": "name",
                        "id": "id"
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
                      "related_resources": [
                        {
                          "resource_type": "Account",
                          "name": "name",
                          "id": "id"
                        },
                        {
                          "resource_type": "Account",
                          "name": "name",
                          "id": "id"
                        }
                      ],
                      "memo": {
                        "description": "description",
                        "account": {
                          "resource_type": "Account",
                          "name": "name",
                          "id": "id"
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
                          "id": "id"
                        },
                        {
                          "resource_type": "Account",
                          "name": "name",
                          "id": "id"
                        }
                      ],
                      "memo": {
                        "description": "description",
                        "account": {
                          "resource_type": "Account",
                          "name": "name",
                          "id": "id"
                        }
                      }
                    },
                    "id": "id",
                    "related_resources": [
                      {
                        "resource_type": "Account",
                        "name": "name",
                        "id": "id"
                      },
                      {
                        "resource_type": "Account",
                        "name": "name",
                        "id": "id"
                      }
                    ],
                    "memo": {
                      "description": "description",
                      "account": {
                        "resource_type": "Account",
                        "name": "name",
                        "id": "id"
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
                      "related_resources": [
                        {
                          "resource_type": "Account",
                          "name": "name",
                          "id": "id"
                        },
                        {
                          "resource_type": "Account",
                          "name": "name",
                          "id": "id"
                        }
                      ],
                      "memo": {
                        "description": "description",
                        "account": {
                          "resource_type": "Account",
                          "name": "name",
                          "id": "id"
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
                          "id": "id"
                        },
                        {
                          "resource_type": "Account",
                          "name": "name",
                          "id": "id"
                        }
                      ],
                      "memo": {
                        "description": "description",
                        "account": {
                          "resource_type": "Account",
                          "name": "name",
                          "id": "id"
                        }
                      }
                    },
                    "id": "id",
                    "related_resources": [
                      {
                        "resource_type": "Account",
                        "name": "name",
                        "id": "id"
                      },
                      {
                        "resource_type": "Account",
                        "name": "name",
                        "id": "id"
                      }
                    ],
                    "memo": {
                      "description": "description",
                      "account": {
                        "resource_type": "Account",
                        "name": "name",
                        "id": "id"
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
                      "related_resources": [
                        {
                          "resource_type": "Account",
                          "name": "name",
                          "id": "id"
                        },
                        {
                          "resource_type": "Account",
                          "name": "name",
                          "id": "id"
                        }
                      ],
                      "memo": {
                        "description": "description",
                        "account": {
                          "resource_type": "Account",
                          "name": "name",
                          "id": "id"
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
                          "id": "id"
                        },
                        {
                          "resource_type": "Account",
                          "name": "name",
                          "id": "id"
                        }
                      ],
                      "memo": {
                        "description": "description",
                        "account": {
                          "resource_type": "Account",
                          "name": "name",
                          "id": "id"
                        }
                      }
                    },
                    "id": "id",
                    "related_resources": [
                      {
                        "resource_type": "Account",
                        "name": "name",
                        "id": "id"
                      },
                      {
                        "resource_type": "Account",
                        "name": "name",
                        "id": "id"
                      }
                    ],
                    "memo": {
                      "description": "description",
                      "account": {
                        "resource_type": "Account",
                        "name": "name",
                        "id": "id"
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
                      "related_resources": [
                        {
                          "resource_type": "Account",
                          "name": "name",
                          "id": "id"
                        },
                        {
                          "resource_type": "Account",
                          "name": "name",
                          "id": "id"
                        }
                      ],
                      "memo": {
                        "description": "description",
                        "account": {
                          "resource_type": "Account",
                          "name": "name",
                          "id": "id"
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
                          "id": "id"
                        },
                        {
                          "resource_type": "Account",
                          "name": "name",
                          "id": "id"
                        }
                      ],
                      "memo": {
                        "description": "description",
                        "account": {
                          "resource_type": "Account",
                          "name": "name",
                          "id": "id"
                        }
                      }
                    },
                    "id": "id",
                    "related_resources": [
                      {
                        "resource_type": "Account",
                        "name": "name",
                        "id": "id"
                      },
                      {
                        "resource_type": "Account",
                        "name": "name",
                        "id": "id"
                      }
                    ],
                    "memo": {
                      "description": "description",
                      "account": {
                        "resource_type": "Account",
                        "name": "name",
                        "id": "id"
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
                      "related_resources": [
                        {
                          "resource_type": "Account",
                          "name": "name",
                          "id": "id"
                        },
                        {
                          "resource_type": "Account",
                          "name": "name",
                          "id": "id"
                        }
                      ],
                      "memo": {
                        "description": "description",
                        "account": {
                          "resource_type": "Account",
                          "name": "name",
                          "id": "id"
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
                          "id": "id"
                        },
                        {
                          "resource_type": "Account",
                          "name": "name",
                          "id": "id"
                        }
                      ],
                      "memo": {
                        "description": "description",
                        "account": {
                          "resource_type": "Account",
                          "name": "name",
                          "id": "id"
                        }
                      }
                    },
                    "id": "id",
                    "related_resources": [
                      {
                        "resource_type": "Account",
                        "name": "name",
                        "id": "id"
                      },
                      {
                        "resource_type": "Account",
                        "name": "name",
                        "id": "id"
                      }
                    ],
                    "memo": {
                      "description": "description",
                      "account": {
                        "resource_type": "Account",
                        "name": "name",
                        "id": "id"
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
                            "id": "id"
                          },
                          {
                            "resource_type": "Account",
                            "name": "name",
                            "id": "id"
                          }
                        ],
                        "memo": {
                          "description": "description",
                          "account": {
                            "resource_type": "Account",
                            "name": "name",
                            "id": "id"
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
                            "id": "id"
                          },
                          {
                            "resource_type": "Account",
                            "name": "name",
                            "id": "id"
                          }
                        ],
                        "memo": {
                          "description": "description",
                          "account": {
                            "resource_type": "Account",
                            "name": "name",
                            "id": "id"
                          }
                        }
                      }
                    ],
                    "id": "id",
                    "related_resources": [
                      {
                        "resource_type": "Account",
                        "name": "name",
                        "id": "id"
                      },
                      {
                        "resource_type": "Account",
                        "name": "name",
                        "id": "id"
                      }
                    ],
                    "memo": {
                      "description": "description",
                      "account": {
                        "resource_type": "Account",
                        "name": "name",
                        "id": "id"
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
                        "id": "id"
                      },
                      {
                        "resource_type": "Account",
                        "name": "name",
                        "id": "id"
                      }
                    ],
                    "memo": {
                      "description": "description",
                      "account": {
                        "resource_type": "Account",
                        "name": "name",
                        "id": "id"
                      }
                    }
                  },
                  "id": "id",
                  "related_resources": [
                    {
                      "resource_type": "Account",
                      "name": "name",
                      "id": "id"
                    },
                    {
                      "resource_type": "Account",
                      "name": "name",
                      "id": "id"
                    }
                  ],
                  "memo": {
                    "description": "description",
                    "account": {
                      "resource_type": "Account",
                      "name": "name",
                      "id": "id"
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
                            "id": "id"
                          },
                          {
                            "resource_type": "Account",
                            "name": "name",
                            "id": "id"
                          }
                        ],
                        "memo": {
                          "description": "description",
                          "account": {
                            "resource_type": "Account",
                            "name": "name",
                            "id": "id"
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
                            "id": "id"
                          },
                          {
                            "resource_type": "Account",
                            "name": "name",
                            "id": "id"
                          }
                        ],
                        "memo": {
                          "description": "description",
                          "account": {
                            "resource_type": "Account",
                            "name": "name",
                            "id": "id"
                          }
                        }
                      }
                    ],
                    "id": "id",
                    "related_resources": [
                      {
                        "resource_type": "Account",
                        "name": "name",
                        "id": "id"
                      },
                      {
                        "resource_type": "Account",
                        "name": "name",
                        "id": "id"
                      }
                    ],
                    "memo": {
                      "description": "description",
                      "account": {
                        "resource_type": "Account",
                        "name": "name",
                        "id": "id"
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
                        "id": "id"
                      },
                      {
                        "resource_type": "Account",
                        "name": "name",
                        "id": "id"
                      }
                    ],
                    "memo": {
                      "description": "description",
                      "account": {
                        "resource_type": "Account",
                        "name": "name",
                        "id": "id"
                      }
                    }
                  },
                  "id": "id",
                  "related_resources": [
                    {
                      "resource_type": "Account",
                      "name": "name",
                      "id": "id"
                    },
                    {
                      "resource_type": "Account",
                      "name": "name",
                      "id": "id"
                    }
                  ],
                  "memo": {
                    "description": "description",
                    "account": {
                      "resource_type": "Account",
                      "name": "name",
                      "id": "id"
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
                        "related_resources": [
                          {
                            "resource_type": "Account",
                            "name": "name",
                            "id": "id"
                          },
                          {
                            "resource_type": "Account",
                            "name": "name",
                            "id": "id"
                          }
                        ],
                        "memo": {
                          "description": "description",
                          "account": {
                            "resource_type": "Account",
                            "name": "name",
                            "id": "id"
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
                            "id": "id"
                          },
                          {
                            "resource_type": "Account",
                            "name": "name",
                            "id": "id"
                          }
                        ],
                        "memo": {
                          "description": "description",
                          "account": {
                            "resource_type": "Account",
                            "name": "name",
                            "id": "id"
                          }
                        }
                      }
                    ],
                    "id": "id",
                    "related_resources": [
                      {
                        "resource_type": "Account",
                        "name": "name",
                        "id": "id"
                      },
                      {
                        "resource_type": "Account",
                        "name": "name",
                        "id": "id"
                      }
                    ],
                    "memo": {
                      "description": "description",
                      "account": {
                        "resource_type": "Account",
                        "name": "name",
                        "id": "id"
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
                        "id": "id"
                      },
                      {
                        "resource_type": "Account",
                        "name": "name",
                        "id": "id"
                      }
                    ],
                    "memo": {
                      "description": "description",
                      "account": {
                        "resource_type": "Account",
                        "name": "name",
                        "id": "id"
                      }
                    }
                  },
                  "id": "id",
                  "related_resources": [
                    {
                      "resource_type": "Account",
                      "name": "name",
                      "id": "id"
                    },
                    {
                      "resource_type": "Account",
                      "name": "name",
                      "id": "id"
                    }
                  ],
                  "memo": {
                    "description": "description",
                    "account": {
                      "resource_type": "Account",
                      "name": "name",
                      "id": "id"
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
        JsonAssert.AreEqual(response, mockResponse);
    }
}
