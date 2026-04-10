<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class EndpointsError extends JsonSerializableType
{
    /**
     * @var value-of<EndpointsErrorCategory> $category
     */
    #[JsonProperty('category')]
    public string $category;

    /**
     * @var value-of<EndpointsErrorCode> $code
     */
    #[JsonProperty('code')]
    public string $code;

    /**
     * @var ?string $detail
     */
    #[JsonProperty('detail')]
    public ?string $detail;

    /**
     * @var ?string $field
     */
    #[JsonProperty('field')]
    public ?string $field;

    /**
     * @param array{
     *   category: value-of<EndpointsErrorCategory>,
     *   code: value-of<EndpointsErrorCode>,
     *   detail?: ?string,
     *   field?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->category = $values['category'];
        $this->code = $values['code'];
        $this->detail = $values['detail'] ?? null;
        $this->field = $values['field'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
