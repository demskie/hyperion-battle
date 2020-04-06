package bignum

import "testing"

func TestFactorial(t *testing.T) {
	n := &bn{}
	res := &bn{}

	bignumFromUint16(n, 100)

	t0 := &bn{}
	bignumAssign(t0, n)

	bignumDec(n)

	for !bignumEquals(n, &bn{}) {
		bignumMul(t0, n, res)
		bignumDec(n)
		bignumAssign(t0, res)
	}
	bignumAssign(res, t0)

	if bignumToString(res) != expectedFactorial {
		t.Error(bignumToString(res))
	}
}

const expectedFactorial = "93326215443944152681699238856266700490715968264381621468592963895217599993229915608941463976156518286253697920827223758251185210916864000000000000000000000000"
