package bignum

import (
	"encoding/binary"
	"encoding/hex"
	"math"
)

type bn [bnArraySize]byte

const bnArraySize = 128

const minVal = 0
const maxVal = 255

func bignumInit(a *bn) {
	for i := 0; i < bnArraySize; i++ {
		a[i] = 0
	}
}

func bignumFromUint16(a *bn, i uint16) {
	binary.LittleEndian.PutUint16(a[:], i)
}

func bignumFromUint32(a *bn, i uint32) {
	binary.LittleEndian.PutUint32(a[:], i)
}

func bignumFromUint64(a *bn, i uint64) {
	binary.LittleEndian.PutUint64(a[:], i)
}

func bignumToUint16(a *bn) uint16 {
	return binary.LittleEndian.Uint16(a[:])
}

func bignumToUint32(a *bn) uint32 {
	return binary.LittleEndian.Uint32(a[:])
}

func bignumToUint64(a *bn) uint64 {
	return binary.LittleEndian.Uint64(a[:])
}

func bignumToString(in *bn) string {
	bytes := []byte{}
	for i := bnArraySize - 1; i >= 0; i-- {
		bytes = append(bytes, in[i])
	}
	for i := 0; i < bnArraySize; i++ {
		if bytes[i] != 0 || i == bnArraySize-1 {
			bytes = bytes[i:]
			break
		}
	}
	return hex.EncodeToString(bytes)
}

func bignumFromString(s string) *bn {
	out := &bn{}
	bytes, _ := hex.DecodeString(s)
	bytes = bytes[:bnArraySize]
	for i := bnArraySize - 1; i >= 0; i-- {
		j := bnArraySize - 1 - i
		out[i] = bytes[j]
	}
	return out
}

func bignumDec(out *bn) {
	var tmp uint8
	var res uint8
	var done bool
	for i := 0; i < bnArraySize; i++ {
		if !done {
			tmp = out[i]
			res = tmp - 1
			out[i] = res
			if !(res > tmp) {
				done = true
			}
		}

	}
}

func bignumInc(out *bn) {
	var res uint8
	var tmp uint16
	var done bool
	for i := 0; i < bnArraySize; i++ {
		if !done {
			tmp = uint16(out[i])
			res = uint8(tmp + 1)
			out[i] = res
			if uint16(res) > tmp {
				done = true
			}
		}
	}
}

func bignumAdd(a, b, out *bn) {
	var tmp uint16
	var carry uint16
	for i := 0; i < bnArraySize; i++ {
		tmp = uint16(a[i]) + uint16(b[i]) + carry
		if tmp > maxVal {
			carry = 1
		} else {
			carry = 0
		}
		out[i] = uint8(tmp % (uint16(maxVal) + 1))
	}
}

func bignumSub(a, b, out *bn) {
	var res uint16
	var tmp1 uint16
	var tmp2 uint16
	var borrow uint16
	for i := 0; i < bnArraySize; i++ {
		tmp1 = uint16(a[i]) + (maxVal + 1)
		tmp2 = uint16(b[i]) + borrow
		res = tmp1 - tmp2
		out[i] = uint8(res % (uint16(maxVal) + 1))
		if res <= maxVal {
			borrow = 1
		} else {
			borrow = 0
		}
	}
}

func bignumMul(a, b, out *bn) {
	bignumInit(out)
	for i := 0; i < bnArraySize; i++ {
		row := &bn{}
		for j := 0; j < bnArraySize; j++ {
			tmp := &bn{}
			intermediate := uint16(a[i]) * uint16(b[j])
			bignumFromUint16(tmp, intermediate)
			lshiftWord(tmp, i+j)
			if i+j < bnArraySize {
				bignumAdd(tmp, row, row)
			}
		}
		bignumAdd(out, row, out)
	}
}

func bignumDiv(a, b, out *bn) {
	bignumInit(out)
	current := &bn{}
	denom := &bn{}
	tmp := &bn{}
	bignumFromUint16(current, 1)
	bignumAssign(denom, b)
	bignumAssign(tmp, a)
	overflow := false
	for i := 0; i < 8*bnArraySize; i++ {
		if bignumCmp(denom, a) == larger {
			break
		}
		if denom[bnArraySize-1] >= uint8(1+maxVal/2) {
			overflow = true
		}
		if !overflow {
			lshiftOneBit(current)
			lshiftOneBit(denom)
		}
	}
	if !overflow {
		rshiftOneBit(denom)
		rshiftOneBit(current)
	}
	for i := 0; i < 8*bnArraySize; i++ {
		if bignumIsZero(current) {
			break
		}
		if bignumCmp(tmp, denom) != smaller {
			bignumSub(tmp, denom, tmp)
			bignumOr(out, current, out)
		}
		rshiftOneBit(current)
		rshiftOneBit(denom)
	}
}

func bignumLshift(a, b *bn, nbits int) {
	bignumAssign(b, a)
	lshiftWord(b, nbits/8)
	bits := uint8(nbits % 8)
	if bits != 0 {
		for i := bnArraySize - 1; i > 0; i-- {
			b[i] = orByte(lshiftByte(b[i], bits), rshiftByte(b[i-1], 8-bits))
		}
		b[0] = lshiftByte(b[0], bits)
	}
}

func bignumRshift(a, b *bn, nbits int) {
	bignumAssign(b, a)
	rshiftWord(b, nbits/8)
	bits := uint8(nbits % 8)
	if bits != 0 {
		for i := 0; i < bnArraySize-1; i++ {
			b[i] = orByte(rshiftByte(b[i], bits), lshiftByte(b[i+1], 8-bits))
		}
		b[bnArraySize-1] = rshiftByte(b[bnArraySize-1], bits)
	}
}

// bignumMod executes divmod and throws away div part
func bignumMod(a, b, c *bn) {
	tmp := &bn{}
	bignumDivmod(a, b, tmp, c)
}

// bignumDivmod puts [a%b in d] and [and a/b in c]
func bignumDivmod(a, b, c, d *bn) {
	tmp := &bn{}
	bignumDiv(a, b, c)
	bignumMul(c, b, tmp)
	bignumSub(a, tmp, d)
}

func bignumAnd(a, b, out *bn) {
	for i := 0; i < bnArraySize; i++ {
		out[i] = andByte(a[i], b[i])
	}
}

func bignumOr(a, b, out *bn) {
	for i := 0; i < bnArraySize; i++ {
		out[i] = orByte(a[i], b[i])
	}
}

func bignumXor(a, b, out *bn) {
	for i := 0; i < bnArraySize; i++ {
		out[i] = xorByte(a[i], b[i])
	}
}

const smaller = int32(-1)
const equal = int32(0)
const larger = int32(1)

func bignumCmp(a, b *bn) int32 {
	for i := bnArraySize - 1; i >= 0; i-- {
		if a[i] > b[i] {
			return larger
		} else if a[i] < b[i] {
			return smaller
		}
	}
	return equal
}

func bignumIsZero(n *bn) bool {
	for i := 0; i < bnArraySize; i++ {
		if n[i] > 0 {
			return false
		}
	}
	return true
}

func bignumPow(a, b, out *bn) {
	bignumInit(out)
	if bignumCmp(b, out) == equal {
		bignumInc(out)
	} else {
		tmp := &bn{}
		bcopy := &bn{}
		bignumAssign(bcopy, b)
		bignumAssign(tmp, a)
		bignumDec(bcopy)
		for i := 0; i < 8*bnArraySize; i++ {
			if bignumIsZero(bcopy) {
				break
			}
			bignumMul(tmp, a, out)
			bignumDec(bcopy)
			bignumAssign(tmp, out)
		}
		bignumAssign(out, tmp)
	}
}

func bignumIsqrt(a, b *bn) {
	low := &bn{}
	high := &bn{}
	mid := &bn{}
	tmp := &bn{}
	bignumInit(low)
	bignumAssign(high, a)
	bignumRshift(high, mid, 1)
	bignumInc(mid)
	for i := 0; i < 8*bnArraySize; i++ {
		if bignumCmp(high, low) <= 0 {
			break
		}
		bignumMul(mid, mid, tmp)
		if bignumCmp(tmp, a) > 0 {
			bignumAssign(high, mid)
			bignumDec(high)
		} else {
			bignumAssign(low, mid)
		}
		bignumSub(high, low, mid)
		rshiftOneBit(mid)
		bignumAdd(low, mid, mid)
		bignumInc(mid)
	}
	bignumAssign(b, low)
}

func bignumAssign(dst, src *bn) {
	for i := 0; i < bnArraySize; i++ {
		dst[i] = src[i]
	}
}

func rshiftWord(a *bn, nwords int) {
	for i := 0; i < bnArraySize; i++ {
		if i < bnArraySize-nwords {
			a[i] = a[i+nwords]
		} else {
			a[i] = 0
		}
	}
}

func lshiftWord(a *bn, nwords int) {
	for i := bnArraySize - 1; i >= 0; i-- {
		if i-nwords >= 0 {
			a[i] = a[i-nwords]
		} else {
			a[i] = 0
		}
	}
}

func lshiftOneBit(a *bn) {
	for i := bnArraySize - 1; i > 0; i-- {
		a[i] = xorByte(lshiftByte(a[i], 1), rshiftByte(a[i-1], (8-1)))
	}
	a[0] = lshiftByte(a[0], 1)
}

func rshiftOneBit(a *bn) {
	for i := 0; i < bnArraySize-1; i++ {
		a[i] = xorByte(rshiftByte(a[i], 1), lshiftByte(a[i+1], (8-1)))
	}
	a[bnArraySize-1] = rshiftByte(a[bnArraySize-1], 1)
}

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////

func lshiftByte(i, m uint8) uint8 {
	return i * uint8(math.Pow(2, float64(m)))
}

func rshiftByte(i, m uint8) uint8 {
	return i / uint8(math.Pow(2, float64(m)))
}

func andByte(a, b uint8) uint8 {
	o := uint8(0)
	for _, x := range []uint8{128, 64, 32, 16, 8, 4, 2, 1} {
		if a >= x && b >= x {
			o += x
		}
		if a >= x {
			a -= x
		}
		if b >= x {
			b -= x
		}
	}
	return o
}

func orByte(a, b uint8) uint8 {
	o := uint8(0)
	for _, x := range []uint8{128, 64, 32, 16, 8, 4, 2, 1} {
		if a >= x || b >= x {
			o += x
		}
		if a >= x {
			a -= x
		}
		if b >= x {
			b -= x
		}
	}
	return o
}

func xorByte(a, b uint8) uint8 {
	o := uint8(0)
	for _, x := range []uint8{128, 64, 32, 16, 8, 4, 2, 1} {
		if (a >= x) != (b >= x) {
			o += x
		}
		if a >= x {
			a -= x
		}
		if b >= x {
			b -= x
		}
	}
	return o
}
