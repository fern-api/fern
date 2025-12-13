<?php

namespace Seed\TestGroup\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Types\PlainObject;

class TestMethodNameTestGroupRequest extends JsonSerializableType
{
    /**
     * @var ?PlainObject $queryParamObject
     */
    public ?PlainObject $queryParamObject;

    /**
     * @var ?int $queryParamInteger
     */
    public ?int $queryParamInteger;

    /**
     * @var ?PlainObject $body
     */
    public ?PlainObject $body;

    /**
     * @param array{
     *   queryParamObject?: ?PlainObject,
     *   queryParamInteger?: ?int,
     *   body?: ?PlainObject,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->queryParamObject = $values['queryParamObject'] ?? null;
        $this->queryParamInteger = $values['queryParamInteger'] ?? null;
        $this->body = $values['body'] ?? null;
    }
}
