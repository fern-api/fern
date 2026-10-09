<?php

namespace Seed\InlinedRequests\Requests;

use Seed\Core\Json\JsonSerializableType;

class PostWithArrayBodyAndHeaders extends JsonSerializableType
{
    /**
     * @var ?string $xCustomHeader
     */
    public ?string $xCustomHeader;

    /**
     * @var array<string> $body
     */
    public array $body;

    /**
     * @param array{
     *   body: array<string>,
     *   xCustomHeader?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->xCustomHeader = $values['xCustomHeader'] ?? null;
        $this->body = $values['body'];
    }
}
