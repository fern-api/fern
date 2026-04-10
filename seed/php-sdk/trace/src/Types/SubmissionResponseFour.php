<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\Union;

class SubmissionResponseFour extends JsonSerializableType
{
    /**
     * @var value-of<SubmissionResponseFourType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @var (
     *    CodeExecutionUpdateZero
     *   |CodeExecutionUpdateOne
     *   |CodeExecutionUpdateTwo
     *   |CodeExecutionUpdateThree
     *   |CodeExecutionUpdateFour
     *   |CodeExecutionUpdateFive
     *   |CodeExecutionUpdateSix
     *   |CodeExecutionUpdateSeven
     *   |CodeExecutionUpdateEight
     *   |CodeExecutionUpdateNine
     *   |CodeExecutionUpdateTen
     * )|null $value
     */
    #[JsonProperty('value'), Union(CodeExecutionUpdateZero::class, CodeExecutionUpdateOne::class, CodeExecutionUpdateTwo::class, CodeExecutionUpdateThree::class, CodeExecutionUpdateFour::class, CodeExecutionUpdateFive::class, CodeExecutionUpdateSix::class, CodeExecutionUpdateSeven::class, CodeExecutionUpdateEight::class, CodeExecutionUpdateNine::class, CodeExecutionUpdateTen::class, 'null')]
    public CodeExecutionUpdateZero|CodeExecutionUpdateOne|CodeExecutionUpdateTwo|CodeExecutionUpdateThree|CodeExecutionUpdateFour|CodeExecutionUpdateFive|CodeExecutionUpdateSix|CodeExecutionUpdateSeven|CodeExecutionUpdateEight|CodeExecutionUpdateNine|CodeExecutionUpdateTen|null $value;

    /**
     * @param array{
     *   type: value-of<SubmissionResponseFourType>,
     *   value?: (
     *    CodeExecutionUpdateZero
     *   |CodeExecutionUpdateOne
     *   |CodeExecutionUpdateTwo
     *   |CodeExecutionUpdateThree
     *   |CodeExecutionUpdateFour
     *   |CodeExecutionUpdateFive
     *   |CodeExecutionUpdateSix
     *   |CodeExecutionUpdateSeven
     *   |CodeExecutionUpdateEight
     *   |CodeExecutionUpdateNine
     *   |CodeExecutionUpdateTen
     * )|null,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->type = $values['type'];
        $this->value = $values['value'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
