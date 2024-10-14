// TODO: make this more concise, and even more specific
export function getOverridesPrompt(openApiSpec: string): string {
    return `
You are an OpenAPI expert, you are given an OpenAPI spec that primarily contains endpoints and schemas. The OpenAPI spec likely does not have endpoint and object naming that is meant for API users to consume.

This is important, we need to write overrides, through OpenAPI extensions outlined below, for the API specification so that the SDK is more user friendly for end users that did not build this API. Your job is to read the documentation of the API and understand the intent of the API, leveraging
the existing endpoint names, descriptions, and schemas to create a set of overrides that make the API more user friendly.

We want the SDK to be more than just a code generator, we want the SDK to be a true representation of the API that is easy to use and understand.

For endpoints, the overrides should contain:
- "x-fern-sdk-method-name":
    - This is used to override the method name of the endpoint.
    - Wherever possible, attempt to make the method name a verb that matches the endpoint's action.
    - Wherever possible, prefer using the verbs: get, create, update, delete, list, etc.
        - get: used for single item retrieval
        - create: used for creating a new item
        - update: used for updating an existing item
        - delete: used for deleting an existing item
        - list: used for retrieving a list of items
    - Very important: Maintain consistency throughout the overrides. Meaning, if you are using the verb "list" for a particular endpoint, then you should be using the verb "list" for all other endpoints that get multiple items from the API, as opposed to a new verb like "getAll".
    - Very important: It is critical that method names are concise and easy to understand, clearly communicating the intent of the endpoint within the API, and more importantly within the SDK group (outlined below).

- "x-fern-sdk-group-name":
    - This is used to segment the API into different packages, or groups, within the SDK.
    - This is used to group together related endpoints, making them easier for the end user to find and understand.
    - Wherever possible, try to put related endpoints within the same group.
    - Example: 
        - this group name:
            \`\`\`
                x-fern-sdk-group-name:
                 - users
                 - orders
                x-fern-sdk-method-name: create
            \`\`\`
          will expose the endpoint as \`client.users.orders.create()\`, note that we've created two groups here (users and orders).
    - Very important: Method names within the same group should be unique. That means that if we have two lists of group names that are the same, then their corresponding \`x-fern-sdk-method-name\` should be different.
    - Very important: The more critical an endpoint is to the API the more important it is to be quick to access, the most important endpoints should be at the top level and not have an \`x-fern-sdk-group-name\` override at all.

For schemas, the overrides should contain:
- "x-fern-type-name":
    - This is used to override the type name of the schema.
    - Very important: This name is used in the SDK to refer to the type, users will be importing this name to use this type.
    - Very important: This name should be unique within the same SDK group.
- "x-fern-sdk-group-name":
    - TODO...


Here are some end to end examples of how this looks:
    - TODO...

Please write overrides for the following API:
"""
${openApiSpec}
"""
`;
}
