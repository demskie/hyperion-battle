package bignum

import (
	"encoding/binary"
	"encoding/hex"
	"math"
	"math/big"
)

type bn [bnArraySize]byte

const bnArraySize = 128

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
	n := new(big.Int)
	n.SetBytes(bytes)
	return n.String()
}

func bignumToBytes(in *bn) []uint8 {
	bytes := []uint8{}
	for i := 0; i < bnArraySize; i++ {
		bytes = append(bytes, in[i])
	}
	return bytes
}

func bignumFromString(s string) *bn {
	c := &bn{}
	bytes, _ := hex.DecodeString(s)
	bytes = bytes[:bnArraySize]
	for i := bnArraySize - 1; i >= 0; i-- {
		j := bnArraySize - 1 - i
		c[i] = bytes[j]
	}
	return c
}

func bignumAdd(a, b, c *bn) {
	carry := 0
	for i := 0; i < bnArraySize; i++ {
		v := int(a[i]) + int(b[i]) + carry
		if v > 255 {
			carry = 1
		} else {
			carry = 0
		}
		c[i] = uint8(v % 256)
	}
}

func bignumSub(a, b, c *bn) {
	borrow := 0
	for i := 0; i < bnArraySize; i++ {
		v := int(a[i]) - int(b[i]) - borrow
		if v < 0 {
			borrow = 1
		} else {
			borrow = 0
		}
		c[i] = uint8(v % 256)
	}
}

func bignumMul(a, b, c *bn) {
	aStop := 0
	bStop := 0
	for i := bnArraySize - 1; i > 0; i-- {
		if aStop == 0 && a[i] > 0 {
			aStop = i
		}
		if bStop == 0 && b[i] > 0 {
			bStop = i
		}
	}
	t1 := &bn{}
	for i := 0; i < bnArraySize; i++ {
		if aStop < bStop {
			t1[i] = a[i]
			a[i] = b[i]
			b[i] = t1[i]
		}
	}
	nonEmptyBytes := 0
	powerOfTwoBit := 0
	for i := 0; i < bnArraySize; i++ {
		if b[i] > 0 {
			nonEmptyBytes++
		}
		pwr := 1
		for j := 0; j < 8; j++ {
			if int(b[i]) == pwr {
				powerOfTwoBit = i*8 + j
			}
			pwr *= 2
		}
	}
	if aStop == 0 || bStop == 0 {
		carry := 0
		for i := 0; i < bnArraySize; i++ {
			v := int(a[i])*int(b[0]) + carry
			carry = v / 256
			c[i] = uint8(v % 256)
		}
	} else if nonEmptyBytes == 1 && powerOfTwoBit > 0 {
		bignumLshift(a, c, powerOfTwoBit)
	} else {
		for i := 0; i < bnArraySize; i++ {
			c[i] = 0
		}
		for i := 0; i < bnArraySize; i++ {
			row := &bn{}
			for j := 0; j < bnArraySize; j++ {
				v := uint16(a[i]) * uint16(b[j])
				t1[0] = uint8(v % 256)
				t1[1] = uint8(v / 256)
				for k := 2; k < bnArraySize; k++ {
					t1[k] = 0
				}
				bignumLshift(t1, t1, 8*(i+j))
				t2 := &bn{}
				bignumAdd(t1, row, t2)
				bignumAssignIfTrue(row, t2, i+j < 16)
				if j >= aStop || j >= bStop {
					break
				}
			}
			bignumAdd(c, row, c)
		}
	}
}

func bignumDiv(a, b, c *bn) {
	stop := 0
	for i := bnArraySize - 1; i > 0; i-- {
		if stop == 0 && b[i] > 0 {
			stop = i
		}
	}
	nonEmptyBytes := 0
	powerOfTwoBit := 0
	for i := 0; i < bnArraySize; i++ {
		if b[i] > 0 {
			nonEmptyBytes++
		}
		pwr := 1
		for j := 0; j < 8; j++ {
			if int(b[i]) == pwr {
				powerOfTwoBit = i*8 + j
			}
			pwr *= 2
		}
	}
	if stop == 0 {
		rem := 0
		for i := bnArraySize - 1; i >= 0; i-- {
			ent := int(a[i]) + rem*256
			rem = ent % int(b[0])
			c[i] = uint8(ent / int(b[0]))
		}
	} else if nonEmptyBytes == 1 && powerOfTwoBit > 0 {
		bignumRshift(a, c, powerOfTwoBit)
	} else {
		for i := 0; i < bnArraySize; i++ {
			c[i] = 0
		}
		current := &bn{}
		denom := &bn{}
		t1 := &bn{}
		t2 := &bn{}
		t3 := &bn{}
		current[0] = 1
		bignumAssign(denom, b)
		bignumAssign(t1, a)
		hasOverflowed := false
		for i := 0; i < 8*bnArraySize; i++ {
			if bignumGreaterThan(denom, a) {
				break
			}
			if denom[bnArraySize-1] >= uint8(256/2) {
				hasOverflowed = true
				break
			}
			bignumLshift(current, current, 1)
			bignumLshift(denom, denom, 1)
		}
		bignumAssign(t2, current)
		bignumAssign(t3, denom)
		bignumRshift(current, current, 1)
		bignumRshift(denom, denom, 1)
		bignumAssignIfTrue(current, t2, hasOverflowed == false)
		bignumAssignIfTrue(denom, t3, hasOverflowed == false)
		for i := 0; i < 8*bnArraySize; i++ {
			if bignumEquals(current, &bn{}) {
				break
			}
			shouldModify := bignumGreaterThanOrEqual(t1, denom)
			bignumAssign(t2, t1)
			bignumAssign(t3, c)
			bignumSub(t2, denom, t2)
			bignumOr(t3, current, t3)
			bignumAssignIfTrue(t1, t2, shouldModify)
			bignumAssignIfTrue(c, t3, shouldModify)
			bignumRshift(current, current, 1)
			bignumRshift(denom, denom, 1)
		}
	}
}

func bignumLshift(a, b *bn, nbits int) {
	bignumAssign(b, a)
	for i := bnArraySize - 1; i >= 0; i-- {
		if i-nbits/8 >= 0 {
			b[i] = a[i-nbits/8]
		} else {
			b[i] = 0
		}
	}
	bits := uint8(nbits % 8)
	t1 := &bn{}
	bignumAssign(t1, b)
	for i := bnArraySize - 1; i > 0; i-- {
		t1[i] = orByte(lshiftByte(t1[i], bits), rshiftByte(t1[i-1], 8-bits))
	}
	t1[0] = lshiftByte(t1[0], bits)
	bignumAssignIfTrue(b, t1, bits != 0)
}

func bignumRshift(a, b *bn, nbits int) {
	bignumAssign(b, a)
	for i := 0; i < bnArraySize; i++ {
		if i < bnArraySize-nbits/8 {
			b[i] = b[i+nbits/8]
		} else {
			b[i] = 0
		}
	}
	bits := uint8(nbits % 8)
	t1 := &bn{}
	bignumAssign(t1, b)
	for i := 0; i < bnArraySize-1; i++ {
		t1[i] = orByte(rshiftByte(t1[i], bits), lshiftByte(t1[i+1], 8-bits))
	}
	t1[bnArraySize-1] = rshiftByte(t1[bnArraySize-1], bits)
	bignumAssignIfTrue(b, t1, bits != 0)
}

func bignumMod(ia, ib, oc *bn) {
	tc := &bn{}
	bignumDiv(ia, ib, oc)
	bignumMul(oc, ib, tc)
	bignumSub(ia, tc, oc)
}

func bignumAnd(a, b, c *bn) {
	for i := 0; i < bnArraySize; i++ {
		c[i] = andByte(a[i], b[i])
	}
}

func bignumOr(a, b, c *bn) {
	for i := 0; i < bnArraySize; i++ {
		v1 := a[i]
		v2 := b[i]
		o := uint8(0)
		x := uint8(128)
		for j := 0; j < 8; j++ {
			if v1 >= x || v2 >= x {
				o += x
			}
			if v1 >= x {
				v1 -= x
			}
			if v2 >= x {
				v2 -= x
			}
			x /= 2
		}
		c[i] = o
	}
}

func bignumXor(a, b, c *bn) {
	for i := 0; i < bnArraySize; i++ {
		v1 := a[i]
		v2 := b[i]
		o := uint8(0)
		x := uint8(128)
		for j := 0; j < 8; j++ {
			if (v1 >= x) != (v2 >= x) {
				o += x
			}
			if v1 >= x {
				v1 -= x
			}
			if v2 >= x {
				v2 -= x
			}
			x /= 2
		}
		c[i] = o
	}
}

func bignumEquals(a, b *bn) bool {
	cmp := 0
	for i := bnArraySize - 1; i >= 0; i-- {
		if cmp == 0 && a[i] > b[i] {
			cmp++
		}
		if cmp == 0 && a[i] < b[i] {
			cmp--
		}
	}
	return cmp == 0
}

func bignumLessThan(a, b *bn) bool {
	cmp := 0
	for i := bnArraySize - 1; i >= 0; i-- {
		if cmp == 0 && a[i] > b[i] {
			cmp++
		}
		if cmp == 0 && a[i] < b[i] {
			cmp--
		}
	}
	return cmp < 0
}

func bignumLessThanOrEqual(a, b *bn) bool {
	cmp := 0
	for i := bnArraySize - 1; i >= 0; i-- {
		if cmp == 0 && a[i] > b[i] {
			cmp++
		}
		if cmp == 0 && a[i] < b[i] {
			cmp--
		}
	}
	return cmp <= 0
}

func bignumGreaterThan(a, b *bn) bool {
	cmp := 0
	for i := bnArraySize - 1; i >= 0; i-- {
		if cmp == 0 && a[i] > b[i] {
			cmp++
		}
		if cmp == 0 && a[i] < b[i] {
			cmp--
		}
	}
	return cmp > 0
}

func bignumGreaterThanOrEqual(a, b *bn) bool {
	cmp := 0
	for i := bnArraySize - 1; i >= 0; i-- {
		if cmp == 0 && a[i] > b[i] {
			cmp++
		}
		if cmp == 0 && a[i] < b[i] {
			cmp--
		}
	}
	return cmp >= 0
}

func bignumPow(a, b, c *bn) {
	one := &bn{}
	one[0] = 1
	bIsZero := bignumEquals(b, &bn{})
	t1 := &bn{}
	t2 := &bn{}
	bignumAssign(t1, a)
	bignumAssign(t2, b)
	bignumSub(t2, one, t2)
	for i := 0; i < 8*bnArraySize; i++ {
		if bIsZero || bignumEquals(t2, &bn{}) {
			break
		}
		bignumMul(t1, a, c)
		bignumSub(t2, one, t2)
		bignumAssign(t1, c)
	}
	bignumAssign(c, t1)
	bignumInit(t1)
	t1[0] = 1
	bignumAssignIfTrue(c, t1, bIsZero)
}

func bignumSqrt(a, b *bn) {
	one := &bn{}
	one[0] = 1
	low := &bn{}
	high := &bn{}
	mid := &bn{}
	t1 := &bn{}
	bignumAssign(high, a)
	bignumRshift(high, mid, 1)
	bignumAdd(mid, one, mid)
	for i := 0; i < 8*bnArraySize; i++ {
		if bignumLessThanOrEqual(high, low) {
			break
		}
		bignumMul(mid, mid, t1)
		isGreaterThan := bignumGreaterThan(t1, a)
		bignumAssign(t1, mid)
		bignumSub(t1, one, t1)
		bignumAssignIfTrue(high, t1, isGreaterThan)
		bignumAssignIfTrue(low, mid, !isGreaterThan)
		bignumSub(high, low, mid)
		bignumRshift(mid, mid, 1.0)
		bignumAdd(low, mid, mid)
		bignumAdd(mid, one, mid)
	}
	bignumAssign(b, low)
}

func bignumAssign(dst, src *bn) {
	for i := 0; i < bnArraySize; i++ {
		dst[i] = src[i]
	}
}

func bignumAssignIfTrue(dst, src *bn, b bool) {
	for i := 0; i < bnArraySize; i++ {
		if b {
			dst[i] = src[i]
		}
	}
}

func lshiftByte(i, m uint8) uint8 {
	return i * uint8(math.Pow(2, float64(m%8)))
}

func rshiftByte(i, m uint8) uint8 {
	return i / uint8(math.Pow(2, float64(m%8)))
}

func andByte(a, b uint8) uint8 {
	o := uint8(0)
	x := uint8(128)
	for i := 0; i < 8; i++ {
		if a >= x && b >= x {
			o += x
		}
		if a >= x {
			a -= x
		}
		if b >= x {
			b -= x
		}
		x /= 2
	}
	return o
}

func orByte(a, b uint8) uint8 {
	o := uint8(0)
	x := uint8(128)
	for i := 0; i < 8; i++ {
		if a >= x || b >= x {
			o += x
		}
		if a >= x {
			a -= x
		}
		if b >= x {
			b -= x
		}
		x /= 2
	}
	return o
}

func xorByte(a, b uint8) uint8 {
	o := uint8(0)
	x := uint8(128)
	for i := 0; i < 8; i++ {
		if (a >= x) != (b >= x) {
			o += x
		}
		if a >= x {
			a -= x
		}
		if b >= x {
			b -= x
		}
		x /= 2
	}
	return o
}
