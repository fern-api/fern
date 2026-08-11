<?php

namespace Seed\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Types\RefundRequest;

class RefundWithHeaderRequest extends JsonSerializableType
{
    /**
     * @var ?string $xIdempotencyKey
     */
    public ?string $xIdempotencyKey;

    /**
     * @var ?RefundRequest $body
     */
    public ?RefundRequest $body;

    /**
     * @param array{
     *   xIdempotencyKey?: ?string,
     *   body?: ?RefundRequest,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->xIdempotencyKey = $values['xIdempotencyKey'] ?? null;
        $this->body = $values['body'] ?? null;
    }
}
