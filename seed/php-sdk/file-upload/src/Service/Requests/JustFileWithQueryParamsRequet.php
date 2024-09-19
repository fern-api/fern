<?php

namespace Seed\Service\Requests;

class JustFileWithQueryParamsRequet
{
    /**
     * @var int $integer
     */
    public int $integer;

    /**
     * @var array<string> $listOfStrings
     */
    public array $listOfStrings;

    /**
     * @var array<?string> $optionalListOfStrings
     */
    public array $optionalListOfStrings;

    /**
     * @var ?string $maybeString
     */
    public ?string $maybeString;

    /**
     * @var ?int $maybeInteger
     */
    public ?int $maybeInteger;

    /**
     * @param int $integer
     * @param array<string> $listOfStrings
     * @param array<?string> $optionalListOfStrings
     * @param ?string $maybeString
     * @param ?int $maybeInteger
     */
    public function __construct(
        int $integer,
        array $listOfStrings,
        array $optionalListOfStrings,
        ?string $maybeString = null,
        ?int $maybeInteger = null,
    ) {
        $this->integer = $integer;
        $this->listOfStrings = $listOfStrings;
        $this->optionalListOfStrings = $optionalListOfStrings;
        $this->maybeString = $maybeString;
        $this->maybeInteger = $maybeInteger;
    }
}
