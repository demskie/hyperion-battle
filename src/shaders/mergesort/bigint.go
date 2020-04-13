package bignum

import (
	"encoding/binary"
	"math/big"
	"unsafe"
)

type bigint [BIGINTBYTECOUNT]byte

func bigintFromInt64(a *bigint, i int64) {
	u := i
	if i < 0 {
		u *= -1
	}
	binary.LittleEndian.PutUint64(a[:], uint64(u))
	applyTwosComplement(a, i < 0)
}

func bigintToInt64(a *bigint) int64 {
	negative := removeTwosComplement(a)
	v := binary.LittleEndian.Uint64(a[:])
	applyTwosComplement(a, negative)
	if negative {
		return -int64(v)
	}
	return int64(v)
}

func applyTwosComplement(a *bigint, negative bool) {
	if a[BIGINTBYTECOUNT-1] >= 128 {
		a[BIGINTBYTECOUNT-1] -= 128
	}
	if negative {
		for i := 0; i < BIGINTBYTECOUNT; i++ {
			a[i] = 255 - a[i]
		}
		carry := 1
		for i := 0; i < BIGINTBYTECOUNT; i++ {
			v := int(a[i]) + carry
			if v <= 255 {
				carry = 0
			}
			a[i] = uint8(v % 256)
		}
	}
}

func removeTwosComplement(a *bigint) (negative bool) {
	negative = a[BIGINTBYTECOUNT-1] >= 128
	if negative {
		for i := 0; i < BIGINTBYTECOUNT; i++ {
			a[i] = 255 - a[i]
		}
		carry := 1
		for i := 0; i < BIGINTBYTECOUNT; i++ {
			v := int(a[i]) + carry
			if v <= 255 {
				carry = 0
			}
			a[i] = uint8(v % 256)
		}
	}
	return negative
}

func bigintToString(in *bigint) string {
	negative := removeTwosComplement(in)
	bytes := []byte{}
	for i := BIGINTBYTECOUNT - 1; i >= 0; i-- {
		bytes = append(bytes, in[i])
	}
	n := new(big.Int)
	n.SetBytes(bytes)
	applyTwosComplement(in, negative)
	if negative {
		n.Mul(n, big.NewInt(-1))
	}
	return n.String()
}

func bigintToBytes(in *bigint) []uint8 {
	bytes := []uint8{}
	for i := 0; i < BIGINTBYTECOUNT; i++ {
		bytes = append(bytes, in[i])
	}
	return bytes
}

func bigintAdd(a, b, c *bigint) {
	biguintAdd((*biguint)(unsafe.Pointer(a)), (*biguint)(unsafe.Pointer(b)), (*biguint)(unsafe.Pointer(c)))
}

func bigintSub(a, b, c *bigint) {
	biguintSub((*biguint)(unsafe.Pointer(a)), (*biguint)(unsafe.Pointer(b)), (*biguint)(unsafe.Pointer(c)))
}

func bigintMul(a, b, c *bigint) {
	aNegative := removeTwosComplement(a)
	bNegative := removeTwosComplement(b)
	biguintMul((*biguint)(unsafe.Pointer(a)), (*biguint)(unsafe.Pointer(b)), (*biguint)(unsafe.Pointer(c)))
	applyTwosComplement(a, aNegative)
	applyTwosComplement(b, bNegative)
	applyTwosComplement(c, aNegative != bNegative)
}

func bigintDiv(a, b, c *bigint) {
	aNegative := removeTwosComplement(a)
	bNegative := removeTwosComplement(b)
	biguintDiv((*biguint)(unsafe.Pointer(a)), (*biguint)(unsafe.Pointer(b)), (*biguint)(unsafe.Pointer(c)))
	applyTwosComplement(a, aNegative)
	applyTwosComplement(b, bNegative)
	applyTwosComplement(c, aNegative != bNegative)
}

func bigintLshift(a, b *bigint, count int) {
	negative := removeTwosComplement(a)
	biguintLshift((*biguint)(unsafe.Pointer(a)), (*biguint)(unsafe.Pointer(b)), count)
	applyTwosComplement(a, negative)
	applyTwosComplement(b, negative)
}

func bigintLshiftByOne(a *bigint) {
	negative := removeTwosComplement(a)
	biguintLshiftByOne((*biguint)(unsafe.Pointer(a)))
	applyTwosComplement(a, negative)
}

func bigintRshift(a, b *bigint, count int) {
	negative := removeTwosComplement(a)
	biguintRshift((*biguint)(unsafe.Pointer(a)), (*biguint)(unsafe.Pointer(b)), count)
	applyTwosComplement(a, negative)
	applyTwosComplement(b, negative)
}

func bigintRshiftByOne(a *bigint) {
	negative := removeTwosComplement(a)
	biguintRshiftByOne((*biguint)(unsafe.Pointer(a)))
	applyTwosComplement(a, negative)
}

func bigintAnd(a, b, c *bigint) {
	biguintAnd((*biguint)(unsafe.Pointer(a)), (*biguint)(unsafe.Pointer(b)), (*biguint)(unsafe.Pointer(c)))
}

func bigintMod(ia, ib, oc *bigint) {
	// tc := &bigint{}
	// add 128 to every byte (what about MSB containing sign?)
}

func bigintOr(a, b, c *bigint) {
	biguintOr((*biguint)(unsafe.Pointer(a)), (*biguint)(unsafe.Pointer(b)), (*biguint)(unsafe.Pointer(c)))
}

func bigintXor(a, b, c *bigint) {
	biguintXor((*biguint)(unsafe.Pointer(a)), (*biguint)(unsafe.Pointer(b)), (*biguint)(unsafe.Pointer(c)))
}

func bigintEquals(a, b *bigint) bool {
	cmp := 0
	aNegative := removeTwosComplement(a)
	bNegative := removeTwosComplement(b)
	if aNegative == false && bNegative == true {
		cmp++
	}
	if aNegative == true && bNegative == false {
		cmp--
	}
	for i := BIGINTBYTECOUNT - 1; i >= 0; i-- {
		if cmp == 0 && a[i] > b[i] {
			cmp++
		}
		if cmp == 0 && a[i] < b[i] {
			cmp--
		}
	}
	applyTwosComplement(a, aNegative)
	applyTwosComplement(b, bNegative)
	return cmp == 0
}

func bigintLessThan(a, b *bigint) bool {
	cmp := 0
	aNegative := removeTwosComplement(a)
	bNegative := removeTwosComplement(b)
	if aNegative == false && bNegative == true {
		cmp++
	}
	if aNegative == true && bNegative == false {
		cmp--
	}
	for i := BIGINTBYTECOUNT - 1; i >= 0; i-- {
		if cmp == 0 && a[i] > b[i] {
			cmp++
		}
		if cmp == 0 && a[i] < b[i] {
			cmp--
		}
	}
	applyTwosComplement(a, aNegative)
	applyTwosComplement(b, bNegative)
	return cmp < 0
}

func bigintLessThanOrEqual(a, b *bigint) bool {
	cmp := 0
	aNegative := removeTwosComplement(a)
	bNegative := removeTwosComplement(b)
	if aNegative == false && bNegative == true {
		cmp++
	}
	if aNegative == true && bNegative == false {
		cmp--
	}
	for i := BIGINTBYTECOUNT - 1; i >= 0; i-- {
		if cmp == 0 && a[i] > b[i] {
			cmp++
		}
		if cmp == 0 && a[i] < b[i] {
			cmp--
		}
	}
	applyTwosComplement(a, aNegative)
	applyTwosComplement(b, bNegative)
	return cmp <= 0
}

func bigintGreaterThan(a, b *bigint) bool {
	cmp := 0
	aNegative := removeTwosComplement(a)
	bNegative := removeTwosComplement(b)
	if aNegative == false && bNegative == true {
		cmp++
	}
	if aNegative == true && bNegative == false {
		cmp--
	}
	for i := BIGINTBYTECOUNT - 1; i >= 0; i-- {
		if cmp == 0 && a[i] > b[i] {
			cmp++
		}
		if cmp == 0 && a[i] < b[i] {
			cmp--
		}
	}
	applyTwosComplement(a, aNegative)
	applyTwosComplement(b, bNegative)
	return cmp > 0
}

func bigintGreaterThanOrEqual(a, b *bigint) bool {
	cmp := 0
	aNegative := removeTwosComplement(a)
	bNegative := removeTwosComplement(b)
	if aNegative == false && bNegative == true {
		cmp++
	}
	if aNegative == true && bNegative == false {
		cmp--
	}
	for i := BIGINTBYTECOUNT - 1; i >= 0; i-- {
		if cmp == 0 && a[i] > b[i] {
			cmp++
		}
		if cmp == 0 && a[i] < b[i] {
			cmp--
		}
	}
	applyTwosComplement(a, aNegative)
	applyTwosComplement(b, bNegative)
	return cmp >= 0
}

func bigintPow(a, b, c *bigint) {
	biguintPow((*biguint)(unsafe.Pointer(a)), (*biguint)(unsafe.Pointer(b)), (*biguint)(unsafe.Pointer(c)))
	// http://numerical.recipes/forum/showthread.php?p=4707
	// If a negative number is raised to an even power, the result will be positive.
	// If a negative number is raised to an odd power, the result will be negative.
}
