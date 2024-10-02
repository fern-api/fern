<?php

namespace Seed\Package\Requests;

use Seed\Core\Json\SerializableType;

class TestRequest extends SerializableType
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
    ) {
        $this->for = $values['for'];
    }
}
