<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Exception;
use Seed\Core\Json\JsonDecoder;

class CommonsData extends JsonSerializableType
{
    /**
     * @var (
     *    'string'
     *   |'base64'
     *   |'_unknown'
     * ) $type
     */
    public readonly string $type;

    /**
     * @var (
     *    CommonsDataString
     *   |CommonsDataBase64
     *   |mixed
     * ) $value
     */
    public readonly mixed $value;

    /**
     * @param array{
     *   type: (
     *    'string'
     *   |'base64'
     *   |'_unknown'
     * ),
     *   value: (
     *    CommonsDataString
     *   |CommonsDataBase64
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
     * @param CommonsDataString $string
     * @return CommonsData
     */
    public static function string(CommonsDataString $string): CommonsData
    {
        return new CommonsData([
            'type' => 'string',
            'value' => $string,
        ]);
    }

    /**
     * @param CommonsDataBase64 $base64
     * @return CommonsData
     */
    public static function base64(CommonsDataBase64 $base64): CommonsData
    {
        return new CommonsData([
            'type' => 'base64',
            'value' => $base64,
        ]);
    }

    /**
     * @return bool
     */
    public function isString(): bool
    {
        return $this->value instanceof CommonsDataString && $this->type === 'string';
    }

    /**
     * @return CommonsDataString
     */
    public function asString(): CommonsDataString
    {
        if (!($this->value instanceof CommonsDataString && $this->type === 'string')) {
            throw new Exception(
                "Expected string; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }

        return $this->value;
    }

    /**
     * @return bool
     */
    public function isBase64(): bool
    {
        return $this->value instanceof CommonsDataBase64 && $this->type === 'base64';
    }

    /**
     * @return CommonsDataBase64
     */
    public function asBase64(): CommonsDataBase64
    {
        if (!($this->value instanceof CommonsDataBase64 && $this->type === 'base64')) {
            throw new Exception(
                "Expected base64; got " . $this->type . " with value of type " . get_debug_type($this->value),
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
            case 'string':
                $value = $this->asString()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'base64':
                $value = $this->asBase64()->jsonSerialize();
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
            case 'string':
                $args['value'] = CommonsDataString::jsonDeserialize($data);
                break;
            case 'base64':
                $args['value'] = CommonsDataBase64::jsonDeserialize($data);
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
