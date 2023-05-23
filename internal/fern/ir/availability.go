package ir

type Availability struct {
	Status  AvailabilityStatus `json:"status"`
	Message *string            `json:"message"`
}
