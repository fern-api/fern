<?php

namespace Seed\Requests;

class EchoRequest
{
    public function __construct(
        public string $name,
        public int $size,
    )
    {
    }
}
