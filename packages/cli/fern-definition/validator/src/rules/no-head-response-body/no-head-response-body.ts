import { getResponseBodyType } from '@fern-api/fern-definition-schema'

import { Rule } from '../../Rule'

export const NoHeadResponseBodyRule: Rule = {
    name: 'no-head-response-body',
    create: () => {
        return {
            definitionFile: {
                httpEndpoint: ({ endpoint }) => {
                    const method = endpoint.method
                    if (method === 'HEAD' && getResponseBodyType(endpoint) != null) {
                        return [
                            {
                                severity: 'fatal',
                                message: `Endpoint is a ${method}, so it cannot have a response body.`
                            }
                        ]
                    }
                    return []
                }
            }
        }
    }
}
