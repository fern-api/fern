import { FernGeneratorCli } from "../../../configuration/sdk";

const CONFIG: FernGeneratorCli.ReferenceConfig = {
    language: FernGeneratorCli.Language.Python,
    rootSection: {
        endpoints: [
            {
                title: {
                    snippetParts: [
                        {
                            text: "client.get_user()",
                            location: { path: "./src/client.py" }
                        }
                    ],
                    returnValue: {
                        text: "str"
                    }
                },
                description:
                    "Some description specific to the endpoint about users, etc. etc.\n\nIt can also be multi-line.",
                snippet: 'client.get(user_id="ID")',
                parameters: [
                    {
                        name: "user_id",
                        type: "str",
                        description: "The ID of the user to retrieve.",
                        required: true
                    }
                ]
            }
        ]
    },
    sections: [
        {
            title: "Accounts",
            description: "This package contains all endpoints on accounts...",
            endpoints: [
                {
                    title: {
                        snippetParts: [
                            {
                                text: "client.accounts.get()",
                                location: { path: "./src/accounts.py" }
                            }
                        ],
                        returnValue: {
                            text: "Account",
                            location: { path: "./src/accounts.py" }
                        }
                    },
                    description:
                        "Some description specific to the endpoint about accounts, etc. etc.\n\nIt can also be multi-line.",
                    snippet: 'client.accounts.get(account_id="ID")',
                    parameters: [
                        {
                            name: "account_id",
                            type: "str",
                            description:
                                "The ID of the account to retrieve.\n\nThis is a multi-line description as well.",
                            required: true
                        }
                    ]
                }
            ]
        },
        {
            title: "Users",
            description: "This package contains all endpoints on users...",
            endpoints: [
                {
                    title: {
                        snippetParts: [
                            {
                                text: "client.users.get()",
                                location: { path: "./src/users.py" }
                            }
                        ]
                    },
                    description: "Some description specific to the endpoint about users, etc. etc.",
                    snippet: 'client.users.get(user_id="ID", account_id="ACCOUNT_ID")',
                    parameters: [
                        {
                            name: "user_id",
                            type: "str",
                            description: "The ID of the user to retrieve.",
                            required: true
                        },
                        {
                            name: "account_id",
                            type: "str",
                            description: "The ID of the account to retrieve the user from.",
                            required: true
                        }
                    ]
                },
                {
                    title: {
                        snippetParts: [
                            {
                                text: "client.users.update()",
                                location: { path: "./src/users.py" }
                            }
                        ]
                    },
                    description: "Some description specific to the endpoint about users, etc. etc.",
                    snippet: 'client.users.get(update=User(id="ID")',
                    parameters: [
                        {
                            name: "update",
                            type: "User",
                            location: { path: "./src/users.py" },
                            description: "The updated user object to send to the server.",
                            required: true
                        }
                    ]
                }
            ]
        }
    ]
};

export default CONFIG;
