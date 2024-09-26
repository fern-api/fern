<?php

namespace Seed\Users\Requests;

use Seed\Core\SerializableType;

class ListWithGlobalConfigRequest extends SerializableType
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
        array $values = [],
    ) {
        $this->offset = $values['offset'] ?? null;
    }
}
