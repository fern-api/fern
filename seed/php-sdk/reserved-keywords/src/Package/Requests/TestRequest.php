<?php

namespace Seed\Package\Requests;

class TestRequest
{
    /**
     * @var string $for
     */
    public string $for;

    /**
     * @param string $for
     */
    public function __construct(
        string $for,
    ) {
        $this->for = $for;
    }
}
