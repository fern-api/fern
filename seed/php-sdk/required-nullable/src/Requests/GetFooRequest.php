<?php

namespace Seed\Requests;

use Seed\Core\Json\JsonSerializableType;

class GetFooRequest extends JsonSerializableType
{
    /**
     * @var ?string $optionalBaz An optional baz
     */
    public ?string $optionalBaz;

    /**
     * @var ?string $optionalNullableBaz An optional baz
     */
    public ?string $optionalNullableBaz;

    /**
     * @var string $requiredBaz A required baz
     */
    public string $requiredBaz;

    /**
     * @var ?string $requiredNullableBaz A required baz
     */
    public ?string $requiredNullableBaz;

    /**
     * @param array{
     *   requiredBaz: string,
     *   optionalBaz?: ?string,
     *   optionalNullableBaz?: ?string,
     *   requiredNullableBaz?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->optionalBaz = $values['optionalBaz'] ?? null;$this->optionalNullableBaz = $values['optionalNullableBaz'] ?? null;$this->requiredBaz = $values['requiredBaz'];$this->requiredNullableBaz = $values['requiredNullableBaz'] ?? null;
    }
}
