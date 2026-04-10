<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class UnionWithDuplicativeDiscriminantsOne extends JsonSerializableType
{
    /**
     * @var ?value-of<UnionWithDuplicativeDiscriminantsOneType> $type
     */
    #[JsonProperty('type')]
    public ?string $type;

    /**
     * @var string $title
     */
    #[JsonProperty('title')]
    public string $title;

    /**
     * @param array{
     *   title: string,
     *   type?: ?value-of<UnionWithDuplicativeDiscriminantsOneType>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->type = $values['type'] ?? null;
        $this->title = $values['title'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
