package core

// StreamReceiver is the interface for consuming a stream of messages.
// Both Stream and ReconnectingStream implement this interface.
type StreamReceiver[T any] interface {
	Recv() (T, error)
	RecvRaw() ([]byte, error)
	RecvEvent() (StreamEvent[T], error)
	RecvEventRaw() (StreamEventRaw, error)
	Close() error
	LastEventID() string
}
