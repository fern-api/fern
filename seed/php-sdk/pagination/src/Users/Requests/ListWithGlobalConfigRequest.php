<?php

namespace Seed\Users\Requests;

class ListWithGlobalConfigRequest
{
    /**
     * @var ?int $offset
     */
    public ?int $offset;

    /**
     * @param array{
     *   offset?: ?int,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->offset = $values['offset'] ?? null;
    }
}
