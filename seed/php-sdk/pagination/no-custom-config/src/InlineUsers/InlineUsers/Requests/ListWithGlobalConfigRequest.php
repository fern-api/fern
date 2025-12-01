<?php

namespace Seed\InlineUsers\InlineUsers\Requests;

use Seed\Core\Json\JsonSerializableType;

class ListWithGlobalConfigRequest extends JsonSerializableType
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
    )
    {
        $this->offset = $values['offset'] ?? null;
    }
}
