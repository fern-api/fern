<?php

namespace Seed\Admin\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Types\TraceResponseV2;

class AdminStoreTracedTestCaseV2Request extends JsonSerializableType
{
    /**
     * @var array<TraceResponseV2> $body
     */
    public array $body;

    /**
     * @param array{
     *   body: array<TraceResponseV2>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->body = $values['body'];
    }
}
