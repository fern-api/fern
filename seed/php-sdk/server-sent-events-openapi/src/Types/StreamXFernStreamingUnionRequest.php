<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Exception;
use Seed\Core\Json\JsonDecoder;

/**
 * A discriminated union request matching the Vectara pattern (FER-9556). Each variant inherits stream_response from UnionStreamRequestBase via allOf. The importer pins stream_response to Literal[True/False] at this union level, but the allOf inheritance re-introduces it as boolean in each variant, causing the type conflict.
 */
class StreamXFernStreamingUnionRequest extends JsonSerializableType
{
    /**
     * @var false $streamResponse
     */
    #[JsonProperty('stream_response')]
    public bool $streamResponse;

    /**
     * @var (
     *    'message'
     *   |'interrupt'
     *   |'compact'
     *   |'_unknown'
     * ) $type
     */
    public readonly string $type;

    /**
     * @var (
     *    UnionStreamMessageVariant
     *   |UnionStreamInterruptVariant
     *   |UnionStreamCompactVariant
     *   |mixed
     * ) $value
     */
    public readonly mixed $value;

    /**
     * @param array{
     *   streamResponse: false,
     *   type: (
     *    'message'
     *   |'interrupt'
     *   |'compact'
     *   |'_unknown'
     * ),
     *   value: (
     *    UnionStreamMessageVariant
     *   |UnionStreamInterruptVariant
     *   |UnionStreamCompactVariant
     *   |mixed
     * ),
     * } $values
     */
    private function __construct(
        array $values,
    ) {
        $this->streamResponse = $values['streamResponse'];
        $this->type = $values['type'];
        $this->value = $values['value'];
    }

    /**
     * @param false $streamResponse
     * @param UnionStreamMessageVariant $message
     * @return StreamXFernStreamingUnionRequest
     */
    public static function message(bool $streamResponse, UnionStreamMessageVariant $message): StreamXFernStreamingUnionRequest
    {
        return new StreamXFernStreamingUnionRequest([
            'streamResponse' => $streamResponse,
            'type' => 'message',
            'value' => $message,
        ]);
    }

    /**
     * @param false $streamResponse
     * @param UnionStreamInterruptVariant $interrupt
     * @return StreamXFernStreamingUnionRequest
     */
    public static function interrupt(bool $streamResponse, UnionStreamInterruptVariant $interrupt): StreamXFernStreamingUnionRequest
    {
        return new StreamXFernStreamingUnionRequest([
            'streamResponse' => $streamResponse,
            'type' => 'interrupt',
            'value' => $interrupt,
        ]);
    }

    /**
     * @param false $streamResponse
     * @param UnionStreamCompactVariant $compact
     * @return StreamXFernStreamingUnionRequest
     */
    public static function compact(bool $streamResponse, UnionStreamCompactVariant $compact): StreamXFernStreamingUnionRequest
    {
        return new StreamXFernStreamingUnionRequest([
            'streamResponse' => $streamResponse,
            'type' => 'compact',
            'value' => $compact,
        ]);
    }

    /**
     * @return bool
     */
    public function isMessage(): bool
    {
        return $this->value instanceof UnionStreamMessageVariant && $this->type === 'message';
    }

    /**
     * @return UnionStreamMessageVariant
     */
    public function asMessage(): UnionStreamMessageVariant
    {
        if (!($this->value instanceof UnionStreamMessageVariant && $this->type === 'message')) {
            throw new Exception(
                "Expected message; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }

        return $this->value;
    }

    /**
     * @return bool
     */
    public function isInterrupt(): bool
    {
        return $this->value instanceof UnionStreamInterruptVariant && $this->type === 'interrupt';
    }

    /**
     * @return UnionStreamInterruptVariant
     */
    public function asInterrupt(): UnionStreamInterruptVariant
    {
        if (!($this->value instanceof UnionStreamInterruptVariant && $this->type === 'interrupt')) {
            throw new Exception(
                "Expected interrupt; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }

        return $this->value;
    }

    /**
     * @return bool
     */
    public function isCompact(): bool
    {
        return $this->value instanceof UnionStreamCompactVariant && $this->type === 'compact';
    }

    /**
     * @return UnionStreamCompactVariant
     */
    public function asCompact(): UnionStreamCompactVariant
    {
        if (!($this->value instanceof UnionStreamCompactVariant && $this->type === 'compact')) {
            throw new Exception(
                "Expected compact; got " . $this->type . " with value of type " . get_debug_type($this->value),
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
            case 'message':
                $value = $this->asMessage()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'interrupt':
                $value = $this->asInterrupt()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'compact':
                $value = $this->asCompact()->jsonSerialize();
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
        if (!array_key_exists('stream_response', $data)) {
            throw new Exception(
                "JSON data is missing property 'stream_response'",
            );
        }
        if (!($data['stream_response'] === false)) {
            throw new Exception(
                "Expected property 'streamResponse' in JSON data to be false, instead received " . get_debug_type($data['stream_response']),
            );
        }
        $args['streamResponse'] = $data['stream_response'];

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
            case 'message':
                $args['value'] = UnionStreamMessageVariant::jsonDeserialize($data);
                break;
            case 'interrupt':
                $args['value'] = UnionStreamInterruptVariant::jsonDeserialize($data);
                break;
            case 'compact':
                $args['value'] = UnionStreamCompactVariant::jsonDeserialize($data);
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
