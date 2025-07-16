import { python } from '@fern-api/python-ast'

export const serialize_datetime = python.reference({
    modulePath: ['core', 'datetime_utils'],
    name: 'serialize_datetime'
})

export const AsIsFiles = {
    GitIgnore: '.gitignore.Template'
}
