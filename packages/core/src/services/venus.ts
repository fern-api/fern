import { FernVenusApiClient } from '@fern-api/venus-api-sdk'

export function createVenusService({
    environment = process.env.DEFAULT_VENUS_ORIGIN ?? 'https://venus.buildwithfern.com',
    token
}: {
    environment?: string
    token?: string
} = {}): FernVenusApiClient {
    return new FernVenusApiClient({
        environment,
        token
    })
}
