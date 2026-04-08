<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Exception;
use Seed\Core\Json\JsonDecoder;

class StreamProtocolNoCollisionResponse extends JsonSerializableType
{
    /**
     * @var (
     *    'heartbeat'
     *   |'string_data'
     *   |'number_data'
     *   |'object_data'
     *   |'_unknown'
     * ) $event
     */
    public readonly string $event;

    /**
     * @var (
     *    ProtocolHeartbeat
     *   |ProtocolStringEvent
     *   |ProtocolNumberEvent
     *   |ProtocolObjectEvent
     *   |mixed
     * ) $value
     */
    public readonly mixed $value;

    /**
     * @param array{
     *   event: (
     *    'heartbeat'
     *   |'string_data'
     *   |'number_data'
     *   |'object_data'
     *   |'_unknown'
     * ),
     *   value: (
     *    ProtocolHeartbeat
     *   |ProtocolStringEvent
     *   |ProtocolNumberEvent
     *   |ProtocolObjectEvent
     *   |mixed
     * ),
     * } $values
     */
    private function __construct(
        array $values,
    ) {
        $this->event = $values['event'];
        $this->value = $values['value'];
    }

    /**
     * @param ProtocolHeartbeat $heartbeat
     * @return StreamProtocolNoCollisionResponse
     */
    public static function heartbeat(ProtocolHeartbeat $heartbeat): StreamProtocolNoCollisionResponse
    {
        return new StreamProtocolNoCollisionResponse([
            'event' => 'heartbeat',
            'value' => $heartbeat,
        ]);
    }

    /**
     * @param ProtocolStringEvent $stringData
     * @return StreamProtocolNoCollisionResponse
     */
    public static function stringData(ProtocolStringEvent $stringData): StreamProtocolNoCollisionResponse
    {
        return new StreamProtocolNoCollisionResponse([
            'event' => 'string_data',
            'value' => $stringData,
        ]);
    }

    /**
     * @param ProtocolNumberEvent $numberData
     * @return StreamProtocolNoCollisionResponse
     */
    public static function numberData(ProtocolNumberEvent $numberData): StreamProtocolNoCollisionResponse
    {
        return new StreamProtocolNoCollisionResponse([
            'event' => 'number_data',
            'value' => $numberData,
        ]);
    }

    /**
     * @param ProtocolObjectEvent $objectData
     * @return StreamProtocolNoCollisionResponse
     */
    public static function objectData(ProtocolObjectEvent $objectData): StreamProtocolNoCollisionResponse
    {
        return new StreamProtocolNoCollisionResponse([
            'event' => 'object_data',
            'value' => $objectData,
        ]);
    }

    /**
     * @return bool
     */
    public function isHeartbeat(): bool
    {
        return $this->value instanceof ProtocolHeartbeat && $this->event === 'heartbeat';
    }

    /**
     * @return ProtocolHeartbeat
     */
    public function asHeartbeat(): ProtocolHeartbeat
    {
        if (!($this->value instanceof ProtocolHeartbeat && $this->event === 'heartbeat')) {
            throw new Exception(
                "Expected heartbeat; got " . $this->event . " with value of type " . get_debug_type($this->value),
            );
        }

        return $this->value;
    }

    /**
     * @return bool
     */
    public function isStringData(): bool
    {
        return $this->value instanceof ProtocolStringEvent && $this->event === 'string_data';
    }

    /**
     * @return ProtocolStringEvent
     */
    public function asStringData(): ProtocolStringEvent
    {
        if (!($this->value instanceof ProtocolStringEvent && $this->event === 'string_data')) {
            throw new Exception(
                "Expected string_data; got " . $this->event . " with value of type " . get_debug_type($this->value),
            );
        }

        return $this->value;
    }

    /**
     * @return bool
     */
    public function isNumberData(): bool
    {
        return $this->value instanceof ProtocolNumberEvent && $this->event === 'number_data';
    }

    /**
     * @return ProtocolNumberEvent
     */
    public function asNumberData(): ProtocolNumberEvent
    {
        if (!($this->value instanceof ProtocolNumberEvent && $this->event === 'number_data')) {
            throw new Exception(
                "Expected number_data; got " . $this->event . " with value of type " . get_debug_type($this->value),
            );
        }

        return $this->value;
    }

    /**
     * @return bool
     */
    public function isObjectData(): bool
    {
        return $this->value instanceof ProtocolObjectEvent && $this->event === 'object_data';
    }

    /**
     * @return ProtocolObjectEvent
     */
    public function asObjectData(): ProtocolObjectEvent
    {
        if (!($this->value instanceof ProtocolObjectEvent && $this->event === 'object_data')) {
            throw new Exception(
                "Expected object_data; got " . $this->event . " with value of type " . get_debug_type($this->value),
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
        $result['event'] = $this->event;

        $base = parent::jsonSerialize();
        $result = array_merge($base, $result);

        switch ($this->event) {
            case 'heartbeat':
                $value = $this->asHeartbeat()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'string_data':
                $value = $this->asStringData()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'number_data':
                $value = $this->asNumberData()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'object_data':
                $value = $this->asObjectData()->jsonSerialize();
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
        if (!array_key_exists('event', $data)) {
            throw new Exception(
                "JSON data is missing property 'event'",
            );
        }
        $event = $data['event'];
        if (!(is_string($event))) {
            throw new Exception(
                "Expected property 'event' in JSON data to be string, instead received " . get_debug_type($data['event']),
            );
        }

        $args['event'] = $event;
        switch ($event) {
            case 'heartbeat':
                $args['value'] = ProtocolHeartbeat::jsonDeserialize($data);
                break;
            case 'string_data':
                $args['value'] = ProtocolStringEvent::jsonDeserialize($data);
                break;
            case 'number_data':
                $args['value'] = ProtocolNumberEvent::jsonDeserialize($data);
                break;
            case 'object_data':
                $args['value'] = ProtocolObjectEvent::jsonDeserialize($data);
                break;
            case '_unknown':
            default:
                $args['event'] = '_unknown';
                $args['value'] = $data;
        }

        // @phpstan-ignore-next-line
        return new static($args);
    }
}
