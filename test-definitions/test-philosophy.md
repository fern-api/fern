# Fern Exhaustive Testing Philosophy

https://www.sisense.com/blog/rest-api-testing-strategy-what-exactly-should-you-test/

Check/validate REST semantics/conventions:
* Verify protocol/status code for requests
* Verify response:
  * JSON field names, types, values 
  * Error codes are correct 
    
## Testing Hierarchy: 
* Endpoints: 
  * (1) Authenticated
    *  API-wide Authentication 
       *  GET with/without 
          *  Path-param
          *  query-param
       *  POST with/without 
          *  Path-param
          *  Primitive req body
          *  Object req body
          *  File upload 
          *  Check different response types too (not necessarily exhaustive)
       * Errors/status codes 
    *  Specific endpoint authentication 
       *  . . . (same as above) . . . 
  * Unauthenticated 
    *  . . . (same as above) . . . 

Repeat (1) for each type of authentication

### For example, one such test case would be: 

#### Definition 1: API-wide basic auth with GET path_param, POST aliased req body/resp

<pre>
<!-- api.yml -->
name: api
auth: basic

<!-- definition1.yml -->
service: 
    base-path: /accounts
    auth: true
    endpoints: 
        getAccountInfo:
            path: /{account_id}
            path-param: 
                account_id: string
            method: GET
        createAccount: 
            path: /create
            method: POST 
            request: Name 
            response: Account_ID
            <!-- try different req/resp body types in same definition -->
types: 
    Name: string 
    Account_ID : string

</pre>
  
#### Definition 2: Same as Definition 1, except with bearer auth. 

#### Definition 3: Same as Definition 1, except only POST endpoint require authentication

. . . 

#### Definition N

