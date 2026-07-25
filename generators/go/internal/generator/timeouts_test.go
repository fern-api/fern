package generator

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func float64Ptr(v float64) *float64 {
	return &v
}

func TestTimeoutsConfigIsConfigured(t *testing.T) {
	assert.False(t, (*TimeoutsConfig)(nil).IsConfigured())
	assert.False(t, (&TimeoutsConfig{}).IsConfigured())
	assert.True(t, (&TimeoutsConfig{Connect: float64Ptr(5)}).IsConfigured())
	assert.True(t, (&TimeoutsConfig{Read: float64Ptr(30)}).IsConfigured())
	assert.True(t, (&TimeoutsConfig{Write: float64Ptr(0)}).IsConfigured())
}

func TestTimeoutLiteral(t *testing.T) {
	// nil renders as 0 (unset -> phase left unbounded).
	assert.Equal(t, "0", timeoutLiteral(nil))
	// Whole seconds convert to nanoseconds.
	assert.Equal(t, "time.Duration(5000000000)", timeoutLiteral(float64Ptr(5)))
	// Fractional seconds preserve sub-second precision.
	assert.Equal(t, "time.Duration(2500000000)", timeoutLiteral(float64Ptr(2.5)))
	// Zero renders explicitly.
	assert.Equal(t, "time.Duration(0)", timeoutLiteral(float64Ptr(0)))
}
