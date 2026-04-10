<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Exception;
use Seed\Core\Json\JsonDecoder;

class ProblemDescriptionBoard extends JsonSerializableType
{
    /**
     * @var (
     *    'html'
     *   |'variable'
     *   |'testCaseId'
     *   |'_unknown'
     * ) $type
     */
    public readonly string $type;

    /**
     * @var (
     *    ProblemDescriptionBoardHtml
     *   |ProblemDescriptionBoardVariable
     *   |ProblemDescriptionBoardTestCaseId
     *   |mixed
     * ) $value
     */
    public readonly mixed $value;

    /**
     * @param array{
     *   type: (
     *    'html'
     *   |'variable'
     *   |'testCaseId'
     *   |'_unknown'
     * ),
     *   value: (
     *    ProblemDescriptionBoardHtml
     *   |ProblemDescriptionBoardVariable
     *   |ProblemDescriptionBoardTestCaseId
     *   |mixed
     * ),
     * } $values
     */
    private function __construct(
        array $values,
    ) {
        $this->type = $values['type'];
        $this->value = $values['value'];
    }

    /**
     * @param ProblemDescriptionBoardHtml $html
     * @return ProblemDescriptionBoard
     */
    public static function html(ProblemDescriptionBoardHtml $html): ProblemDescriptionBoard
    {
        return new ProblemDescriptionBoard([
            'type' => 'html',
            'value' => $html,
        ]);
    }

    /**
     * @param ProblemDescriptionBoardVariable $variable
     * @return ProblemDescriptionBoard
     */
    public static function variable(ProblemDescriptionBoardVariable $variable): ProblemDescriptionBoard
    {
        return new ProblemDescriptionBoard([
            'type' => 'variable',
            'value' => $variable,
        ]);
    }

    /**
     * @param ProblemDescriptionBoardTestCaseId $testCaseId
     * @return ProblemDescriptionBoard
     */
    public static function testCaseId(ProblemDescriptionBoardTestCaseId $testCaseId): ProblemDescriptionBoard
    {
        return new ProblemDescriptionBoard([
            'type' => 'testCaseId',
            'value' => $testCaseId,
        ]);
    }

    /**
     * @return bool
     */
    public function isHtml(): bool
    {
        return $this->value instanceof ProblemDescriptionBoardHtml && $this->type === 'html';
    }

    /**
     * @return ProblemDescriptionBoardHtml
     */
    public function asHtml(): ProblemDescriptionBoardHtml
    {
        if (!($this->value instanceof ProblemDescriptionBoardHtml && $this->type === 'html')) {
            throw new Exception(
                "Expected html; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }

        return $this->value;
    }

    /**
     * @return bool
     */
    public function isVariable(): bool
    {
        return $this->value instanceof ProblemDescriptionBoardVariable && $this->type === 'variable';
    }

    /**
     * @return ProblemDescriptionBoardVariable
     */
    public function asVariable(): ProblemDescriptionBoardVariable
    {
        if (!($this->value instanceof ProblemDescriptionBoardVariable && $this->type === 'variable')) {
            throw new Exception(
                "Expected variable; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }

        return $this->value;
    }

    /**
     * @return bool
     */
    public function isTestCaseId(): bool
    {
        return $this->value instanceof ProblemDescriptionBoardTestCaseId && $this->type === 'testCaseId';
    }

    /**
     * @return ProblemDescriptionBoardTestCaseId
     */
    public function asTestCaseId(): ProblemDescriptionBoardTestCaseId
    {
        if (!($this->value instanceof ProblemDescriptionBoardTestCaseId && $this->type === 'testCaseId')) {
            throw new Exception(
                "Expected testCaseId; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }

        return $this->value;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }

    /**
     * @return array<mixed>
     */
    public function jsonSerialize(): array
    {
        $result = [];
        $result['type'] = $this->type;

        $base = parent::jsonSerialize();
        $result = array_merge($base, $result);

        switch ($this->type) {
            case 'html':
                $value = $this->asHtml()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'variable':
                $value = $this->asVariable()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'testCaseId':
                $value = $this->asTestCaseId()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case '_unknown':
            default:
                if (is_null($this->value)) {
                    break;
                }
                if ($this->value instanceof JsonSerializableType) {
                    $value = $this->value->jsonSerialize();
                    $result = array_merge($value, $result);
                } elseif (is_array($this->value)) {
                    $result = array_merge($this->value, $result);
                }
        }

        return $result;
    }

    /**
     * @param string $json
     */
    public static function fromJson(string $json): static
    {
        $decodedJson = JsonDecoder::decode($json);
        if (!is_array($decodedJson)) {
            throw new Exception("Unexpected non-array decoded type: " . gettype($decodedJson));
        }
        return self::jsonDeserialize($decodedJson);
    }

    /**
     * @param array<string, mixed> $data
     */
    public static function jsonDeserialize(array $data): static
    {
        $args = [];
        if (!array_key_exists('type', $data)) {
            throw new Exception(
                "JSON data is missing property 'type'",
            );
        }
        $type = $data['type'];
        if (!(is_string($type))) {
            throw new Exception(
                "Expected property 'type' in JSON data to be string, instead received " . get_debug_type($data['type']),
            );
        }

        $args['type'] = $type;
        switch ($type) {
            case 'html':
                $args['value'] = ProblemDescriptionBoardHtml::jsonDeserialize($data);
                break;
            case 'variable':
                $args['value'] = ProblemDescriptionBoardVariable::jsonDeserialize($data);
                break;
            case 'testCaseId':
                $args['value'] = ProblemDescriptionBoardTestCaseId::jsonDeserialize($data);
                break;
            case '_unknown':
            default:
                $args['type'] = '_unknown';
                $args['value'] = $data;
        }

        // @phpstan-ignore-next-line
        return new static($args);
    }
}
