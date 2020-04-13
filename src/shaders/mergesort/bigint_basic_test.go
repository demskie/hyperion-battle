package bignum

import "testing"

func TestBasic(t *testing.T) {
	n1, n2, n3 := &bigint{}, &bigint{}, &bigint{}

	bigintFromInt64(n1, -1)
	// t.Error(bigintToBytes(n1))

	bigintFromInt64(n2, -1)
	// t.Error(bigintToBytes(n2))

	bigintMul(n1, n2, n3)

	// t.Error(bigintToBytes(n3))

	// t.Error(bigintToString(n3))
}
