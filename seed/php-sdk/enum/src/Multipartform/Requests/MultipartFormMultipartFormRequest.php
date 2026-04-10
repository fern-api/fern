<?php

namespace Seed\Multipartform\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Types\Color;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class MultipartFormMultipartFormRequest extends JsonSerializableType
{
    /**
     * @var ?value-of<Color> $color
     */
    #[JsonProperty('color')]
    public ?string $color;

    /**
     * @var ?value-of<Color> $maybeColor
     */
    #[JsonProperty('maybeColor')]
    public ?string $maybeColor;

    /**
     * @var ?array<value-of<Color>> $colorList
     */
    #[JsonProperty('colorList'), ArrayType(['string'])]
    public ?array $colorList;

    /**
     * @var ?array<value-of<Color>> $maybeColorList
     */
    #[JsonProperty('maybeColorList'), ArrayType(['string'])]
    public ?array $maybeColorList;

    /**
     * @param array{
     *   color?: ?value-of<Color>,
     *   maybeColor?: ?value-of<Color>,
     *   colorList?: ?array<value-of<Color>>,
     *   maybeColorList?: ?array<value-of<Color>>,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->color = $values['color'] ?? null;
        $this->maybeColor = $values['maybeColor'] ?? null;
        $this->colorList = $values['colorList'] ?? null;
        $this->maybeColorList = $values['maybeColorList'] ?? null;
    }
}
