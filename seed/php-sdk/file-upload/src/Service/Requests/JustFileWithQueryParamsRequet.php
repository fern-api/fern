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

}
