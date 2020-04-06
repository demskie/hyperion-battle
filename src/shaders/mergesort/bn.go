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

func bignumDec(c *bn) {
	done := 0
	for i := 0; i < bnArraySize; i++ {
		v := int(c[i]) - (1 - done)
		if v >= 0 {
			done = 1
		}
		c[i] = uint8(v % 256)
	}
}

func bignumInc(c *bn) {
	done := 0
	for i := 0; i < bnArraySize; i++ {
		v := int(c[i]) + (1 - done)
		if v <= 255 {
			done = 1
		}
		c[i] = uint8(v % 256)
	}
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
		v1 := int(a[i]) + 256
		v2 := int(b[i]) + borrow
		v3 := v1 - v2
		if v3 <= 255 {
			borrow = 1
		} else {
			borrow = 0
		}
		c[i] = uint8(v3 % 256)
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
	} else if nonEmptyBytes == 1 && powerOfTwoBit > 7 {
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
				words := i + j
				for k := bnArraySize - 1; k >= 0; k-- {
					if k-words >= 0 {
						t1[k] = t1[k-words]
					} else {
						t1[k] = 0
					}
				}
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
			quot := ent / int(b[0])
			c[i] = uint8(quot)
			rem = ent % int(b[0])
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
		for i := 0; i < bnArraySize; i++ {
			denom[i] = b[i]
		}
		for i := 0; i < bnArraySize; i++ {
			t1[i] = a[i]
		}
		hasOverflowed := false
		for i := 0; i < 8*bnArraySize; i++ {
			cmp := 0
			for j := bnArraySize - 1; j >= 0; j-- {
				if cmp == 0 && denom[j] > a[j] {
					cmp = 1
				}
				if cmp == 0 && denom[j] < a[j] {
					cmp = -1
				}
			}
			if cmp == 1 {
				break
			}
			if denom[bnArraySize-1] >= uint8(256/2) {
				hasOverflowed = true
				break
			}
			for i := bnArraySize - 1; i > 0; i-- {
				v1 := current[i] * uint8(math.Pow(2, 1))
				v2 := current[i-1] / uint8(math.Pow(2, 7))
				o := uint8(0)
				x := uint8(128)
				for i := 0; i < 8; i++ {
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
				current[i] = o
			}
			current[0] = current[0] * uint8(math.Pow(2, 1))
			for i := bnArraySize - 1; i > 0; i-- {
				v1 := denom[i] * uint8(math.Pow(2, 1))
				v2 := denom[i-1] / uint8(math.Pow(2, 7))
				o := uint8(0)
				x := uint8(128)
				for i := 0; i < 8; i++ {
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
				denom[i] = o
			}
			denom[0] = denom[0] * uint8(math.Pow(2, 1))
		}
		for i := 0; i < bnArraySize; i++ {
			t2[i] = current[i]
		}
		for i := 0; i < bnArraySize; i++ {
			t3[i] = denom[i]
		}
		for i := 0; i < bnArraySize-1; i++ {
			v1 := current[i] / uint8(math.Pow(2, 1))
			v2 := current[i+1] * uint8(math.Pow(2, 7))
			o := uint8(0)
			x := uint8(128)
			for i := 0; i < 8; i++ {
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
			current[i] = o
		}
		current[bnArraySize-1] = current[bnArraySize-1] / uint8(math.Pow(2, 1))
		for i := 0; i < bnArraySize-1; i++ {
			v1 := denom[i] / uint8(math.Pow(2, 1))
			v2 := denom[i+1] * uint8(math.Pow(2, 7))
			o := uint8(0)
			x := uint8(128)
			for i := 0; i < 8; i++ {
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
			denom[i] = o
		}
		denom[bnArraySize-1] = denom[bnArraySize-1] / uint8(math.Pow(2, 1))
		for i := 0; i < bnArraySize; i++ {
			if hasOverflowed == false {
				current[i] = t2[i]
			}
		}
		for i := 0; i < bnArraySize; i++ {
			if hasOverflowed == false {
				denom[i] = t3[i]
			}
		}
		for i := 0; i < 8*bnArraySize; i++ {
			currentIsZero := true
			for j := 0; j < bnArraySize; j++ {
				if current[j] > 0 {
					currentIsZero = false
				}
			}
			if currentIsZero {
				break
			}
			cmp := 0
			for j := bnArraySize - 1; j >= 0; j-- {
				if cmp == 0 && t1[j] > denom[j] {
					cmp = 1
				}
				if cmp == 0 && t1[j] < denom[j] {
					cmp = -1
				}
			}
			for j := 0; j < bnArraySize; j++ {
				t2[j] = t1[j]
			}
			for j := 0; j < bnArraySize; j++ {
				t3[j] = c[j]
			}
			borrow := 0
			for j := 0; j < bnArraySize; j++ {
				v1 := int(t2[j]) + 256
				v2 := int(denom[j]) + borrow
				v3 := v1 - v2
				if v3 <= 255 {
					borrow = 1
				} else {
					borrow = 0
				}
				t2[j] = uint8(v3 % 256)
			}
			for j := 0; j < bnArraySize; j++ {
				v1 := t3[j]
				v2 := current[j]
				o := uint8(0)
				x := uint8(128)
				for k := 0; k < 8; k++ {
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
				t3[j] = o
			}
			for j := 0; j < bnArraySize; j++ {
				if cmp > -1 {
					t1[j] = t2[j]
				}
			}
			for j := 0; j < bnArraySize; j++ {
				if cmp > -1 {
					c[j] = t3[j]
				}
			}
			for j := 0; j < bnArraySize-1; j++ {
				v1 := current[j] / uint8(math.Pow(2, 1))
				v2 := current[j+1] * uint8(math.Pow(2, 7))
				o := uint8(0)
				x := uint8(128)
				for k := 0; k < 8; k++ {
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
				current[j] = o
			}
			current[bnArraySize-1] = current[bnArraySize-1] / uint8(math.Pow(2, 1))
			for j := 0; j < bnArraySize-1; j++ {
				v1 := denom[j] / uint8(math.Pow(2, 1))
				v2 := denom[j+1] * uint8(math.Pow(2, 7))
				o := uint8(0)
				x := uint8(128)
				for k := 0; k < 8; k++ {
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
				denom[j] = o
			}
			denom[bnArraySize-1] = denom[bnArraySize-1] / uint8(math.Pow(2, 1))
		}
	}
}

func bignumLshift(a, b *bn, nbits int) {
	bignumAssign(b, a)
	lshiftWord(b, nbits/8)
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
	rshiftWord(b, nbits/8)
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

func bignumCmp(a, b *bn) int32 {
	for i := bnArraySize - 1; i >= 0; i-- {
		if a[i] > b[i] {
			return 1
		} else if a[i] < b[i] {
			return -1
		}
	}
	return 0
}

func bignumIsZero(n *bn) bool {
	for i := 0; i < bnArraySize; i++ {
		if n[i] > 0 {
			return false
		}
	}
	return true
}

func bignumPow(a, b, c *bn) {
	bIsZero := true
	for i := 0; i < bnArraySize; i++ {
		if b[i] > 0 {
			bIsZero = false
		}
	}
	t1 := &bn{}
	t2 := &bn{}
	bignumAssign(t1, a)
	bignumAssign(t2, b)
	bignumDec(t2)
	for i := 0; i < 8*bnArraySize; i++ {
		if bIsZero {
			break
		}
		t2IsZero := true
		for i := 0; i < bnArraySize; i++ {
			if t2[i] > 0 {
				t2IsZero = false
			}
		}
		if t2IsZero {
			break
		}
		bignumMul(t1, a, c)
		bignumDec(t2)
		bignumAssign(t1, c)
	}
	bignumAssign(c, t1)
	bignumInit(t1)
	t1[0] = 1
	bignumAssignIfTrue(c, t1, bIsZero)
}

func bignumSqrt(a, b *bn) {
	low := &bn{}
	high := &bn{}
	mid := &bn{}
	tmp := &bn{}
	bignumAssign(high, a)
	bignumRshift(high, mid, 1)
	bignumInc(mid)
	for i := 0; i < 8*bnArraySize; i++ {
		if bignumCmp(high, low) <= 0 {
			break
		}
		bignumMul(mid, mid, tmp)
		isGreaterThan := bignumCmp(tmp, a) == 1
		t1 := &bn{}
		bignumAssign(t1, mid)
		bignumDec(t1)
		bignumAssignIfTrue(high, t1, isGreaterThan)
		bignumAssignIfTrue(low, mid, !isGreaterThan)
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

func bignumAssignIfTrue(dst, src *bn, b bool) {
	for i := 0; i < bnArraySize; i++ {
		if b {
			dst[i] = src[i]
		}
	}
}

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////

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
		v1 := a[i] * uint8(math.Pow(2, 1))
		v2 := a[i-1] / uint8(math.Pow(2, 7))
		o := uint8(0)
		x := uint8(128)
		for i := 0; i < 8; i++ {
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
		a[i] = o
	}
	a[0] = a[0] * uint8(math.Pow(2, 1))
}

func rshiftOneBit(a *bn) {
	for i := 0; i < bnArraySize-1; i++ {
		v1 := a[i] / uint8(math.Pow(2, 1))
		v2 := a[i+1] * uint8(math.Pow(2, 7))
		o := uint8(0)
		x := uint8(128)
		for i := 0; i < 8; i++ {
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
		a[i] = o
	}
	a[bnArraySize-1] = a[bnArraySize-1] / uint8(math.Pow(2, 1))
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
