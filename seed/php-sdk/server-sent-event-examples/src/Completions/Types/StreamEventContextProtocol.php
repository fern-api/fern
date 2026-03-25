<?php

namespace Seed\Completions\Types;

use Seed\Core\Json\JsonSerializableType;
use Exception;
use Seed\Core\Json\JsonDecoder;

class StreamEventContextProtocol extends JsonSerializableType
{
    /**
     * @var (
     *    'completion'
     *   |'error'
     *   |'event'
     *   |'_unknown'
     * ) $event
     */
    public readonly string $event;

    /**
     * @var (
     *    CompletionEvent
     *   |ErrorEvent
     *   |EventEvent
     *   |mixed
     * ) $value
     */
    public readonly mixed $value;

    /**
     * @param array{
     *   event: (
     *    'completion'
     *   |'error'
     *   |'event'
     *   |'_unknown'
     * ),
     *   value: (
     *    CompletionEvent
     *   |ErrorEvent
     *   |EventEvent
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
     * @param CompletionEvent $completion
     * @return StreamEventContextProtocol
     */
    public static function completion(CompletionEvent $completion): StreamEventContextProtocol
    {
        return new StreamEventContextProtocol([
            'event' => 'completion',
            'value' => $completion,
        ]);
    }

    /**
     * @param ErrorEvent $error
     * @return StreamEventContextProtocol
     */
    public static function error(ErrorEvent $error): StreamEventContextProtocol
    {
        return new StreamEventContextProtocol([
            'event' => 'error',
            'value' => $error,
        ]);
    }

    /**
     * @param EventEvent $event
     * @return StreamEventContextProtocol
     */
    public static function event(EventEvent $event): StreamEventContextProtocol
    {
        return new StreamEventContextProtocol([
            'event' => 'event',
            'value' => $event,
        ]);
    }

    /**
     * @return bool
     */
    public function isCompletion(): bool
    {
        return $this->value instanceof CompletionEvent && $this->event === 'completion';
    }

    /**
     * @return CompletionEvent
     */
    public function asCompletion(): CompletionEvent
    {
        if (!($this->value instanceof CompletionEvent && $this->event === 'completion')) {
            throw new Exception(
                "Expected completion; got " . $this->event . " with value of type " . get_debug_type($this->value),
            );
        }

        return $this->value;
    }

    /**
     * @return bool
     */
    public function isError(): bool
    {
        return $this->value instanceof ErrorEvent && $this->event === 'error';
    }

    /**
     * @return ErrorEvent
     */
    public function asError(): ErrorEvent
    {
        if (!($this->value instanceof ErrorEvent && $this->event === 'error')) {
            throw new Exception(
                "Expected error; got " . $this->event . " with value of type " . get_debug_type($this->value),
            );
        }

        return $this->value;
    }

    /**
     * @return bool
     */
    public function isEvent(): bool
    {
        return $this->value instanceof EventEvent && $this->event === 'event';
    }

    /**
     * @return EventEvent
     */
    public function asEvent(): EventEvent
    {
        if (!($this->value instanceof EventEvent && $this->event === 'event')) {
            throw new Exception(
                "Expected event; got " . $this->event . " with value of type " . get_debug_type($this->value),
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
            case 'completion':
                $value = $this->asCompletion()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'error':
                $value = $this->asError()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'event':
                $value = $this->asEvent()->jsonSerialize();
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
            case 'completion':
                $args['value'] = CompletionEvent::jsonDeserialize($data);
                break;
            case 'error':
                $args['value'] = ErrorEvent::jsonDeserialize($data);
                break;
            case 'event':
                $args['value'] = EventEvent::jsonDeserialize($data);
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
