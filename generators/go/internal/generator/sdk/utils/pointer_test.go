package core

import (
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestBool(t *testing.T) {
	value := true
	ptr := Bool(value)
	assert.NotNil(t, ptr)
	assert.Equal(t, value, *ptr)
}

func TestByte(t *testing.T) {
	value := byte(42)
	ptr := Byte(value)
	assert.NotNil(t, ptr)
	assert.Equal(t, value, *ptr)
}

func TestComplex64(t *testing.T) {
	value := complex64(1 + 2i)
	ptr := Complex64(value)
	assert.NotNil(t, ptr)
	assert.Equal(t, value, *ptr)
}

func TestComplex128(t *testing.T) {
	value := complex128(1 + 2i)
	ptr := Complex128(value)
	assert.NotNil(t, ptr)
	assert.Equal(t, value, *ptr)
}

func TestFloat32(t *testing.T) {
	value := float32(3.14)
	ptr := Float32(value)
	assert.NotNil(t, ptr)
	assert.Equal(t, value, *ptr)
}

func TestFloat64(t *testing.T) {
	value := 3.14159
	ptr := Float64(value)
	assert.NotNil(t, ptr)
	assert.Equal(t, value, *ptr)
}

func TestInt(t *testing.T) {
	value := 42
	ptr := Int(value)
	assert.NotNil(t, ptr)
	assert.Equal(t, value, *ptr)
}

func TestInt8(t *testing.T) {
	value := int8(42)
	ptr := Int8(value)
	assert.NotNil(t, ptr)
	assert.Equal(t, value, *ptr)
}

func TestInt16(t *testing.T) {
	value := int16(42)
	ptr := Int16(value)
	assert.NotNil(t, ptr)
	assert.Equal(t, value, *ptr)
}

func TestInt32(t *testing.T) {
	value := int32(42)
	ptr := Int32(value)
	assert.NotNil(t, ptr)
	assert.Equal(t, value, *ptr)
}

func TestInt64(t *testing.T) {
	value := int64(42)
	ptr := Int64(value)
	assert.NotNil(t, ptr)
	assert.Equal(t, value, *ptr)
}

func TestRune(t *testing.T) {
	value := 'A'
	ptr := Rune(value)
	assert.NotNil(t, ptr)
	assert.Equal(t, value, *ptr)
}

func TestString(t *testing.T) {
	value := "hello"
	ptr := String(value)
	assert.NotNil(t, ptr)
	assert.Equal(t, value, *ptr)
}

func TestUint(t *testing.T) {
	value := uint(42)
	ptr := Uint(value)
	assert.NotNil(t, ptr)
	assert.Equal(t, value, *ptr)
}

func TestUint8(t *testing.T) {
	value := uint8(42)
	ptr := Uint8(value)
	assert.NotNil(t, ptr)
	assert.Equal(t, value, *ptr)
}

func TestUint16(t *testing.T) {
	value := uint16(42)
	ptr := Uint16(value)
	assert.NotNil(t, ptr)
	assert.Equal(t, value, *ptr)
}

func TestUint32(t *testing.T) {
	value := uint32(42)
	ptr := Uint32(value)
	assert.NotNil(t, ptr)
	assert.Equal(t, value, *ptr)
}

func TestUint64(t *testing.T) {
	value := uint64(42)
	ptr := Uint64(value)
	assert.NotNil(t, ptr)
	assert.Equal(t, value, *ptr)
}

func TestUintptr(t *testing.T) {
	value := uintptr(42)
	ptr := Uintptr(value)
	assert.NotNil(t, ptr)
	assert.Equal(t, value, *ptr)
}

func TestUUID(t *testing.T) {
	value := uuid.New()
	ptr := UUID(value)
	assert.NotNil(t, ptr)
	assert.Equal(t, value, *ptr)
}

func TestTime(t *testing.T) {
	value := time.Now()
	ptr := Time(value)
	assert.NotNil(t, ptr)
	assert.Equal(t, value, *ptr)
}

func TestMustParseDate(t *testing.T) {
	t.Run("valid date", func(t *testing.T) {
		result := MustParseDate("2024-01-15")
		expected, _ := time.Parse("2006-01-02", "2024-01-15")
		assert.Equal(t, expected, result)
	})

	t.Run("invalid date panics", func(t *testing.T) {
		assert.Panics(t, func() {
			MustParseDate("invalid-date")
		})
	})
}

func TestMustParseDateTime(t *testing.T) {
	t.Run("valid datetime", func(t *testing.T) {
		result := MustParseDateTime("2024-01-15T10:30:00Z")
		expected, _ := time.Parse(time.RFC3339, "2024-01-15T10:30:00Z")
		assert.Equal(t, expected, result)
	})

	t.Run("invalid datetime panics", func(t *testing.T) {
		assert.Panics(t, func() {
			MustParseDateTime("invalid-datetime")
		})
	})
}

func TestPointerHelpersWithZeroValues(t *testing.T) {
	t.Run("zero bool", func(t *testing.T) {
		ptr := Bool(false)
		assert.NotNil(t, ptr)
		assert.Equal(t, false, *ptr)
	})

	t.Run("zero int", func(t *testing.T) {
		ptr := Int(0)
		assert.NotNil(t, ptr)
		assert.Equal(t, 0, *ptr)
	})

	t.Run("empty string", func(t *testing.T) {
		ptr := String("")
		assert.NotNil(t, ptr)
		assert.Equal(t, "", *ptr)
	})

	t.Run("zero time", func(t *testing.T) {
		zeroTime := time.Time{}
		ptr := Time(zeroTime)
		assert.NotNil(t, ptr)
		assert.Equal(t, zeroTime, *ptr)
	})
}
