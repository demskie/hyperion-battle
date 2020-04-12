package bignum

import "testing"

func TestBasic(t *testing.T) {
	n1, n2, n3 := &bigint{}, &bigint{}, &bigint{}
	bigintFromInt32(n1, -2)
	// t.Error(bigintToBytes(n1))
	// removeTwosComplement(n1)
	// t.Error(bigintToBytes(n1))

	bigintFromInt32(n2, 2)
	bigintAdd(n1, n2, n3)

	t.Error(bigintToString(n3))
	t.Error(bigintToBytes(n3))
	removeTwosComplement(n3)
	t.Error(bigintToBytes(n3))
	t.Error(bigintToString(n3))
}
