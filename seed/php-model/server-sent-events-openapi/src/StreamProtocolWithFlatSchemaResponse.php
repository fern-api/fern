<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Exception;
use Seed\Core\Json\JsonDecoder;

class StreamProtocolWithFlatSchemaResponse extends JsonSerializableType
{
    /**
     * @var (
     *    'heartbeat'
     *   |'entity'
     *   |'_unknown'
     * ) $event
     */
    public readonly string $event;

    /**
     * @var (
     *    DataContextHeartbeat
     *   |DataContextEntityEvent
     *   |mixed
     * ) $value
     */
    public readonly mixed $value;

    /**
     * @param array{
     *   event: (
     *    'heartbeat'
     *   |'entity'
     *   |'_unknown'
     * ),
     *   value: (
     *    DataContextHeartbeat
     *   |DataContextEntityEvent
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
     * @param DataContextHeartbeat $heartbeat
     * @return StreamProtocolWithFlatSchemaResponse
     */
    public static function heartbeat(DataContextHeartbeat $heartbeat): StreamProtocolWithFlatSchemaResponse
    {
        return new StreamProtocolWithFlatSchemaResponse([
            'event' => 'heartbeat',
            'value' => $heartbeat,
        ]);
    }

    /**
     * @param DataContextEntityEvent $entity
     * @return StreamProtocolWithFlatSchemaResponse
     */
    public static function entity(DataContextEntityEvent $entity): StreamProtocolWithFlatSchemaResponse
    {
        return new StreamProtocolWithFlatSchemaResponse([
            'event' => 'entity',
            'value' => $entity,
        ]);
    }

    /**
     * @return bool
     */
    public function isHeartbeat(): bool
    {
        return $this->value instanceof DataContextHeartbeat && $this->event === 'heartbeat';
    }

    /**
     * @return DataContextHeartbeat
     */
    public function asHeartbeat(): DataContextHeartbeat
    {
        if (!($this->value instanceof DataContextHeartbeat && $this->event === 'heartbeat')) {
            throw new Exception(
                "Expected heartbeat; got " . $this->event . " with value of type " . get_debug_type($this->value),
            );
        }

        return $this->value;
    }

    /**
     * @return bool
     */
    public function isEntity(): bool
    {
        return $this->value instanceof DataContextEntityEvent && $this->event === 'entity';
    }

    /**
     * @return DataContextEntityEvent
     */
    public function asEntity(): DataContextEntityEvent
    {
        if (!($this->value instanceof DataContextEntityEvent && $this->event === 'entity')) {
            throw new Exception(
                "Expected entity; got " . $this->event . " with value of type " . get_debug_type($this->value),
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
            case 'entity':
                $value = $this->asEntity()->jsonSerialize();
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
                $args['value'] = DataContextHeartbeat::jsonDeserialize($data);
                break;
            case 'entity':
                $args['value'] = DataContextEntityEvent::jsonDeserialize($data);
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
