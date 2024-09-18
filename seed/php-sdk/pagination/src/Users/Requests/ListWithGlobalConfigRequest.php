<?php

namespace Seed\Users\Requests;

class ListWithGlobalConfigRequest
{
    /**
     * @var ?int $offset
     */
    public ?int $offset;

    /**
     * @param ?int $offset
     */
    public function __construct(
        ?int $offset = null,
    ) {
        $this->offset = $offset;
    }
}
