<?php

namespace Seed\Package\Requests;

class TestRequest
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
