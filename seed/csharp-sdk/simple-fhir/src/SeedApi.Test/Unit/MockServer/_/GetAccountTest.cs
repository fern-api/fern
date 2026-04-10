using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer._;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GetAccountTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
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

        var response = await Client._.GetAccountAsync(
            new GetAccountRequest { AccountId = "account_id" }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string mockResponse = """
            {
              "id": "id",
              "related_resources": [
                {
                  "resource_type": "Patient",
                  "id": "id",
                  "related_resources": [],
                  "memo": {
                    "description": "description"
                  },
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
                    "resource_type": "Practitioner",
                    "id": "id",
                    "related_resources": [],
                    "memo": {
                      "description": "description"
                    },
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
                        "resource_type": "Practitioner",
                        "id": "id",
                        "related_resources": [],
                        "memo": {
                          "description": "description"
                        },
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
                    "resource_type": "Patient",
                    "id": "id",
                    "related_resources": [],
                    "memo": {
                      "description": "description"
                    },
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

        var response = await Client._.GetAccountAsync(
            new GetAccountRequest { AccountId = "account_id" }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
