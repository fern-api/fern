<?php

namespace <%= namespace%>;

/**
 * Framing strategy used by `Stream` to interpret a streaming HTTP response body.
 */
enum StreamFormat: string
{
    case Sse = 'sse';
    case Json = 'json';
    case Text = 'text';
}
