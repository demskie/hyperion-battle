package bignum

import "testing"

func TestFactorial(t *testing.T) {
	n := &biguint{}
	res := &biguint{}
	one := &biguint{}
	one[0] = 1

	biguintFromUint64(n, 100)

	t0 := &biguint{}
	biguintAssign(t0, n)

	biguintSub(n, one, n)

	for !biguintEquals(n, &biguint{}) {
		biguintMul(t0, n, res)
		biguintSub(n, one, n)
		biguintAssign(t0, res)
	}
	biguintAssign(res, t0)

	if biguintToString(res) != expectedFactorial {
		t.Error(biguintToString(res))
	}
}

const expectedFactorial = "93326215443944152681699238856266700490715968264381621468592963895217599993229915608941463976156518286253697920827223758251185210916864000000000000000000000000"
