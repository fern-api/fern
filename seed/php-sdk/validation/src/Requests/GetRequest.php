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
     * @param float $decimal
     * @param int $even
     * @param string $name
     */
    public function __construct(
        float $decimal,
        int $even,
        string $name,
    ) {
        $this->decimal = $decimal;
        $this->even = $even;
        $this->name = $name;
    }
}
