import { Blob_ } from './blob'
import { Express } from './express/Express'
import { Fs } from './fs'
import { Stream } from './stream'

export interface ExternalDependencies {
    express: Express
    fs: Fs
    blob: Blob_
    stream: Stream
}
