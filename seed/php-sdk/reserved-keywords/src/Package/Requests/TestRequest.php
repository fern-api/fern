<?php

namespace Seed\Package\Requests;

use Seed\Core\Json\JsonSerializableType;

class TestRequest extends JsonSerializableType
{
    /**
     * @var string $for
     */
    public string $for;

    /**
     * @param array{
     *   for: string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->for = $values['for'];
    }
}
