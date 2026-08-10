<?php

namespace Seed\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Types\RefundRequest;

class RefundBody extends JsonSerializableType
{
    /**
     * @var ?RefundRequest $body
     */
    public ?RefundRequest $body;

    /**
     * @param array{
     *   body?: ?RefundRequest,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->body = $values['body'] ?? null;
    }
}
