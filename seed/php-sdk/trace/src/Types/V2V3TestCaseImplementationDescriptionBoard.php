<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Exception;
use Seed\Core\Json\JsonDecoder;

class V2V3TestCaseImplementationDescriptionBoard extends JsonSerializableType
{
    /**
     * @var (
     *    'html'
     *   |'paramId'
     *   |'_unknown'
     * ) $type
     */
    public readonly string $type;

    /**
     * @var (
     *    V2V3TestCaseImplementationDescriptionBoardHtml
     *   |V2V3TestCaseImplementationDescriptionBoardParamId
     *   |mixed
     * ) $value
     */
    public readonly mixed $value;

    /**
     * @param array{
     *   type: (
     *    'html'
     *   |'paramId'
     *   |'_unknown'
     * ),
     *   value: (
     *    V2V3TestCaseImplementationDescriptionBoardHtml
     *   |V2V3TestCaseImplementationDescriptionBoardParamId
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
     * @param V2V3TestCaseImplementationDescriptionBoardHtml $html
     * @return V2V3TestCaseImplementationDescriptionBoard
     */
    public static function html(V2V3TestCaseImplementationDescriptionBoardHtml $html): V2V3TestCaseImplementationDescriptionBoard
    {
        return new V2V3TestCaseImplementationDescriptionBoard([
            'type' => 'html',
            'value' => $html,
        ]);
    }

    /**
     * @param V2V3TestCaseImplementationDescriptionBoardParamId $paramId
     * @return V2V3TestCaseImplementationDescriptionBoard
     */
    public static function paramId(V2V3TestCaseImplementationDescriptionBoardParamId $paramId): V2V3TestCaseImplementationDescriptionBoard
    {
        return new V2V3TestCaseImplementationDescriptionBoard([
            'type' => 'paramId',
            'value' => $paramId,
        ]);
    }

    /**
     * @return bool
     */
    public function isHtml(): bool
    {
        return $this->value instanceof V2V3TestCaseImplementationDescriptionBoardHtml && $this->type === 'html';
    }

    /**
     * @return V2V3TestCaseImplementationDescriptionBoardHtml
     */
    public function asHtml(): V2V3TestCaseImplementationDescriptionBoardHtml
    {
        if (!($this->value instanceof V2V3TestCaseImplementationDescriptionBoardHtml && $this->type === 'html')) {
            throw new Exception(
                "Expected html; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }

        return $this->value;
    }

    /**
     * @return bool
     */
    public function isParamId(): bool
    {
        return $this->value instanceof V2V3TestCaseImplementationDescriptionBoardParamId && $this->type === 'paramId';
    }

    /**
     * @return V2V3TestCaseImplementationDescriptionBoardParamId
     */
    public function asParamId(): V2V3TestCaseImplementationDescriptionBoardParamId
    {
        if (!($this->value instanceof V2V3TestCaseImplementationDescriptionBoardParamId && $this->type === 'paramId')) {
            throw new Exception(
                "Expected paramId; got " . $this->type . " with value of type " . get_debug_type($this->value),
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
            case 'paramId':
                $value = $this->asParamId()->jsonSerialize();
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
                $args['value'] = V2V3TestCaseImplementationDescriptionBoardHtml::jsonDeserialize($data);
                break;
            case 'paramId':
                $args['value'] = V2V3TestCaseImplementationDescriptionBoardParamId::jsonDeserialize($data);
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
