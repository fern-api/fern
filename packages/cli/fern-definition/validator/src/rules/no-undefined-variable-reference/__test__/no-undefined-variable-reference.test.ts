import { AbsoluteFilePath, RelativeFilePath, join } from '@fern-api/fs-utils'

import { ValidationViolation } from '../../../ValidationViolation'
import { getViolationsForRule } from '../../../testing-utils/getViolationsForRule'
import { NoUndefinedVariableReferenceRule } from '../no-undefined-variable-reference'

describe('no-undefined-variable-reference', () => {
    it('simple', async () => {
        const violations = await getViolationsForRule({
            rule: NoUndefinedVariableReferenceRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of('fixtures'),
                RelativeFilePath.of('simple')
            )
        })

        const expectedViolations: ValidationViolation[] = [
            {
                message: 'Variable $var-missing is not defined.',
                nodePath: ['path-parameters', 'baz'],
                relativeFilepath: RelativeFilePath.of('api.yml'),
                severity: 'fatal'
            },
            {
                message: 'Variable reference must start with $',
                nodePath: ['path-parameters', 'biz', 'variable'],
                relativeFilepath: RelativeFilePath.of('api.yml'),
                severity: 'fatal'
            },
            {
                message: 'Variable $var-missing is not defined.',
                nodePath: ['service', 'endpoints', 'test', 'path-parameters', 'baz'],
                relativeFilepath: RelativeFilePath.of('simple.yml'),
                severity: 'fatal'
            },
            {
                message: 'Variable reference must start with $',
                nodePath: ['service', 'endpoints', 'test', 'path-parameters', 'biz', 'variable'],
                relativeFilepath: RelativeFilePath.of('simple.yml'),
                severity: 'fatal'
            }
        ]

        expect(violations).toEqual(expectedViolations)
    })
})
