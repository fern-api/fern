# Defining errors

With Fern, you can make your own errors!

- errors are forward compatibile; you can add errors as you go without breaking clients
- errors have statusCode and body (you can define the structure of the body)
- an endpoint can throw different errors
- all errors by default are generated with an error instanceId. this makes it so that when an error occurs and it logs out, you can put it into your cloudwatch logs or datadog to filter for the logs that correspond to the specific error. (for every error instance, a new errorId is created) [this was taken from conjure and palantir]
