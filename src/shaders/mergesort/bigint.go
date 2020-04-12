package bignum

import (
	"encoding/binary"
	"math/big"
	"unsafe"
)

type bigint [arraysize]byte

const arraysize = 8

/*

A simple answer is to make both numbers positive (take the absolute value), perform the division, then negate the result if the XOR of the two original sign bits is 1.

For example, let's divide -7 by 5. Using 4-bit twos-complement binary encoding, that is 1001 div 0101. Taking the absolute value of each results in 0111 div 0101. The divide yields 0001. Since the XOR of the two original sign bits is 1, this value is negated. Negating means complementing then incrementing by 1. The negative of 0001 is 1111, which is the final answer. 1111 in decimal is -1.

*/

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
	if a[arraysize-1] >= 128 {
		a[arraysize-1] -= 128
	}
	if negative {
		for i := 0; i < arraysize; i++ {
			a[i] = 255 - a[i]
		}
		carry := 1
		for i := 0; i < arraysize; i++ {
			v := int(a[i]) + carry
			if v <= 255 {
				carry = 0
			}
			a[i] = uint8(v % 256)
		}
	}
}

func removeTwosComplement(a *bigint) (negative bool) {
	negative = a[arraysize-1] >= 128
	if negative {
		for i := 0; i < arraysize; i++ {
			a[i] = 255 - a[i]
		}
		carry := 1
		for i := 0; i < arraysize; i++ {
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
	for i := arraysize - 1; i >= 0; i-- {
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
	for i := 0; i < arraysize; i++ {
		bytes = append(bytes, in[i])
	}
	return bytes
}

func bigintAdd(a, b, c *bigint) {
	bignumAdd((*bn)(unsafe.Pointer(a)), (*bn)(unsafe.Pointer(b)), (*bn)(unsafe.Pointer(c)))
}

func bigintSub(a, b, c *bigint) {
	bignumSub((*bn)(unsafe.Pointer(a)), (*bn)(unsafe.Pointer(b)), (*bn)(unsafe.Pointer(c)))
}

func bigintMul(a, b, c *bigint) {
	aNegative := removeTwosComplement(a)
	bNegative := removeTwosComplement(b)
	bignumMul((*bn)(unsafe.Pointer(a)), (*bn)(unsafe.Pointer(b)), (*bn)(unsafe.Pointer(c)))
	applyTwosComplement(a, aNegative)
	applyTwosComplement(b, bNegative)
	applyTwosComplement(c, aNegative != bNegative)
}

func bigintDiv(a, b, c *bigint) {
	aNegative := removeTwosComplement(a)
	bNegative := removeTwosComplement(b)
	bignumDiv((*bn)(unsafe.Pointer(a)), (*bn)(unsafe.Pointer(b)), (*bn)(unsafe.Pointer(c)))
	applyTwosComplement(a, aNegative)
	applyTwosComplement(b, bNegative)
	applyTwosComplement(c, aNegative != bNegative)
}
