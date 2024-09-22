<?php

namespace Seed\Requests;

class GetRequest
{
    /**
     * @var float $decimal
     */
    public float $decimal;

    /**
     * @var int $even
     */
    public int $even;

    /**
     * @var string $name
     */
    public string $name;

    /**
     * @param array{
     *   decimal: float,
     *   even: int,
     *   name: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->decimal = $values['decimal'];
        $this->even = $values['even'];
        $this->name = $values['name'];
    }
}
