package bignum

import "testing"

func TestFactorial(t *testing.T) {
	n := &bn{}
	res := &bn{}

	bignumFromUint16(n, 100)

	tmp := &bn{}
	bignumAssign(tmp, n)

	bignumDec(n)

	for bignumIsZero(n) == 0 {
		bignumMul(tmp, n, res)
		bignumDec(n)
		bignumAssign(tmp, res)
	}
	bignumAssign(res, tmp)

	if bignumToString(res) != expectedFactorial {
		t.Error(bignumToString(res))
	}
}

const expectedFactorial = "1b30964ec395dc24069528d54bbda40d16e966ef9a70eb21b5b2943a321cdf10391745570cca9420c6ecb3b72ed2ee8b02ea2735c61a000000000000000000000000"
