<?php

namespace Seed\Service\Requests;

class JustFileWithQueryParamsRequet
{
    /**
     * @var ?string $maybeString
     */
    public ?string $maybeString;

    /**
     * @var int $integer
     */
    public int $integer;

    /**
     * @var ?int $maybeInteger
     */
    public ?int $maybeInteger;

    /**
     * @var array<string> $listOfStrings
     */
    public array $listOfStrings;

    /**
     * @var array<?string> $optionalListOfStrings
     */
    public array $optionalListOfStrings;

    /**
     * @param array{
     *   maybeString?: ?string,
     *   integer: int,
     *   maybeInteger?: ?int,
     *   listOfStrings: array<string>,
     *   optionalListOfStrings: array<?string>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->maybeString = $values['maybeString'] ?? null;
        $this->integer = $values['integer'];
        $this->maybeInteger = $values['maybeInteger'] ?? null;
        $this->listOfStrings = $values['listOfStrings'];
        $this->optionalListOfStrings = $values['optionalListOfStrings'];
    }
}
