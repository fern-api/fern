import { generatorsYml } from '@fern-api/configuration'

import { type BaseOpenAPIWorkspace } from './BaseOpenAPIWorkspace'

export function getBaseOpenAPIWorkspaceSettingsFromGeneratorInvocation(
    generatorInvocation: generatorsYml.GeneratorInvocation
): Partial<BaseOpenAPIWorkspace.Settings> | undefined {
    if (generatorInvocation.settings == null && generatorInvocation.raw?.api?.auth == null) {
        return undefined
    }
    const result: Partial<BaseOpenAPIWorkspace.Settings> = {
        detectGlobalHeaders: true
    }

    if (generatorInvocation.settings?.unions === 'v1') {
        result.discriminatedUnionV2 = true
    }

    if (generatorInvocation.raw?.api?.auth != null) {
        result.auth = generatorInvocation.raw?.api?.auth
    }

    return result
}
