package bignum

import (
	"encoding/binary"
	"math/big"
)

// BIGINTBYTECOUNT ...
const BIGINTBYTECOUNT = 128

type biguint [BIGINTBYTECOUNT]byte

func biguintFromUint64(a *biguint, i uint64) {
	binary.LittleEndian.PutUint64(a[:], i)
}

func biguintToUint64(a biguint) uint64 {
	return binary.LittleEndian.Uint64(a[:])
}

func biguintToString(in biguint) string {
	bytes := []byte{}
	for i := BIGINTBYTECOUNT - 1; i >= 0; i-- {
		bytes = append(bytes, in[i])
	}
	n := new(big.Int)
	n.SetBytes(bytes)
	return n.String()
}

func biguintToBytes(in *biguint) []uint8 {
	bytes := []uint8{}
	for i := 0; i < BIGINTBYTECOUNT; i++ {
		bytes = append(bytes, in[i])
	}
	return bytes
}

func biguintAdd(a, b biguint, c *biguint) {
	carry := 0
	for i := 0; i < BIGINTBYTECOUNT; i++ {
		v := int(a[i]) + int(b[i]) + carry
		if v > 255 {
			carry = 1
		} else {
			carry = 0
		}
		c[i] = uint8(v % 256)
	}
}

func biguintSub(a, b biguint, c *biguint) {
	borrow := 0
	for i := 0; i < BIGINTBYTECOUNT; i++ {
		v := int(a[i]) - int(b[i]) - borrow
		if v < 0 {
			borrow = 1
		} else {
			borrow = 0
		}
		c[i] = uint8(v % 256)
	}
}

func biguintMul(a, b biguint, c *biguint) {
	aStop := 0
	bStop := 0
	for i := BIGINTBYTECOUNT - 1; i > 0; i-- {
		if aStop == 0 && a[i] > 0 {
			aStop = i
		}
		if bStop == 0 && b[i] > 0 {
			bStop = i
		}
	}
	t1 := [2 * BIGINTBYTECOUNT]uint8{}
	for i := 0; i < BIGINTBYTECOUNT; i++ {
		if aStop < bStop {
			t1[i] = a[i]
			a[i] = b[i]
			b[i] = t1[i]
		}
	}
	nonEmptyBytes := 0
	powerOfTwoBit := 0
	for i := 0; i < BIGINTBYTECOUNT; i++ {
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
		for i := 0; i < BIGINTBYTECOUNT; i++ {
			v := int(a[i])*int(b[0]) + carry
			carry = v / 256
			c[i] = uint8(v % 256)
		}
	} else if nonEmptyBytes == 1 && powerOfTwoBit > 0 {
		biguintLshift(a, c, powerOfTwoBit)
	} else {
		var product, carry uint16
		for i := 0; i < BIGINTBYTECOUNT; i++ {
			t1[i] = 0
		}
		for i := 0; i < BIGINTBYTECOUNT; i++ {
			for j := 0; j < BIGINTBYTECOUNT; j++ {
				product = uint16(a[i])*uint16(b[j]) + uint16(t1[i+j])
				carry = product / 256
				t1[i+j] = uint8(product - carry*256)
				t1[i+j+1] += uint8(carry)
			}
		}
		for i := 0; i < BIGINTBYTECOUNT; i++ {
			c[i] = t1[i]
		}
	}
}

func biguintDiv(a, b biguint, c *biguint) {
	stop := 0
	for i := BIGINTBYTECOUNT - 1; i > 0; i-- {
		if stop == 0 && b[i] > 0 {
			stop = i
		}
	}
	nonEmptyBytes := 0
	powerOfTwoBit := 0
	for i := 0; i < BIGINTBYTECOUNT; i++ {
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
		for i := BIGINTBYTECOUNT - 1; i >= 0; i-- {
			ent := int(a[i]) + rem*256
			rem = ent % int(b[0])
			c[i] = uint8(ent / int(b[0]))
		}
	} else if nonEmptyBytes == 1 && powerOfTwoBit > 0 {
		biguintRshift(a, c, powerOfTwoBit)
	} else {
		for i := 0; i < BIGINTBYTECOUNT; i++ {
			c[i] = 0
		}
		var current, denom, t1, t2, t3 biguint
		current[0] = 1
		biguintAssign(&denom, b)
		biguintAssign(&t1, a)
		hasOverflowed := false
		for i := 0; i < 8*BIGINTBYTECOUNT; i++ {
			if biguintGreaterThan(denom, a) {
				break
			}
			if denom[BIGINTBYTECOUNT-1] >= uint8(256/2) {
				hasOverflowed = true
				break
			}
			biguintLshiftByOne(&current)
			biguintLshiftByOne(&denom)
		}
		biguintAssign(&t2, current)
		biguintAssign(&t3, denom)
		biguintRshiftByOne(&current)
		biguintRshiftByOne(&denom)
		biguintAssignIfTrue(&current, t2, hasOverflowed == false)
		biguintAssignIfTrue(&denom, t3, hasOverflowed == false)
		for i := 0; i < 8*BIGINTBYTECOUNT; i++ {
			if biguintEquals(current, biguint{}) {
				break
			}
			shouldModify := biguintGreaterThanOrEqual(t1, denom)
			biguintAssign(&t2, t1)
			biguintAssign(&t3, *c)
			biguintSub(t2, denom, &t2)
			biguintOr(t3, current, &t3)
			biguintAssignIfTrue(&t1, t2, shouldModify)
			biguintAssignIfTrue(c, t3, shouldModify)
			biguintRshiftByOne(&current)
			biguintRshiftByOne(&denom)
		}
	}
}

/*
func biguintLshift(a biguint, b *biguint, count int) {
	if count > BIGINTBYTECOUNT*8 {
		count = BIGINTBYTECOUNT * 8
	}
	byteCount := count / 8
	biguintAssign(b, a)
	for i := 0; i < BIGINTBYTECOUNT; i++ {
		for j := BIGINTBYTECOUNT - 1; j > 0; j-- {
			if byteCount > 0 {
				b[j] = b[j-1]
			}
		}
		if byteCount > 0 {
			b[0] = 0
		}
		byteCount--
	}
	count = count % 8
	bits := [BIGINTBYTECOUNT * 8]uint8{}
	for i := 0; i < BIGINTBYTECOUNT; i++ {
		v := uint8(b[BIGINTBYTECOUNT-1-i])
		x := uint8(128)
		for j := 0; j < 8; j++ {
			// bits[i*8+j] = v >= x
			if v >= x {
				bits[i*8+j] = 1
				v -= x
			}
			x /= 2
		}
	}
	for i := 0; i < 8; i++ {
		for j := 0; j < BIGINTBYTECOUNT*8-1; j++ {
			bits[j] = bits[j+1]
		}
		bits[BIGINTBYTECOUNT*8-1] = 0
		for j := 0; j < BIGINTBYTECOUNT; j++ {
			if i < count {
				v := bits[j*8+0] * 128
				v += bits[j*8+1] * 64
				v += bits[j*8+2] * 32
				v += bits[j*8+3] * 16
				v += bits[j*8+4] * 8
				v += bits[j*8+5] * 4
				v += bits[j*8+6] * 2
				v += bits[j*8+7] * 1
				b[BIGINTBYTECOUNT-1-j] = byte(v)
			}
		}
	}
}
*/

func biguintLshift(a biguint, b *biguint, count int) {
	biguintAssign(b, a)
	lshiftWord(b, count/8)
	bits := uint8(count % 8)
	t1 := &biguint{}
	biguintAssign(t1, *b)
	for i := BIGINTBYTECOUNT - 1; i > 0; i-- {
		t1[i] = orByte(lshiftByte(t1[i], bits), rshiftByte(t1[i-1], 8-bits))
	}
	t1[0] = lshiftByte(t1[0], bits)
	biguintAssignIfTrue(b, *t1, bits != 0)
}

/*
func biguintLshiftByOne(a *biguint) {
	bits := [BIGINTBYTECOUNT * 8]uint8{}
	for i := 0; i < BIGINTBYTECOUNT; i++ {
		v := uint8(a[BIGINTBYTECOUNT-1-i])
		x := uint8(128)
		for j := 0; j < 8; j++ {
			// bits[i*8+j] = v >= x
			if v >= x {
				bits[i*8+j] = 1
				v -= x
			}
			x /= 2
		}
	}
	for i := 0; i < BIGINTBYTECOUNT*8-1; i++ {
		bits[i] = bits[i+1]
	}
	bits[BIGINTBYTECOUNT*8-1] = 0
	for i := 0; i < BIGINTBYTECOUNT; i++ {
		v := bits[i*8+0] * 128
		v += bits[i*8+1] * 64
		v += bits[i*8+2] * 32
		v += bits[i*8+3] * 16
		v += bits[i*8+4] * 8
		v += bits[i*8+5] * 4
		v += bits[i*8+6] * 2
		v += bits[i*8+7] * 1
		a[BIGINTBYTECOUNT-1-i] = byte(v)
	}
}
*/

func biguintLshiftByOne(a *biguint) {
	for i := BIGINTBYTECOUNT - 1; i > 0; i-- {
		a[i] = orByte(lshiftByte(a[i], 1), rshiftByte(a[i-1], 8-1))
	}
	a[0] = lshiftByte(a[0], 1)
}

/*
func biguintRshift(a biguint, b *biguint, count int) {
	if count > BIGINTBYTECOUNT*8 {
		count = BIGINTBYTECOUNT * 8
	}
	byteCount := count / 8
	biguintAssign(b, a)
	for i := 0; i < BIGINTBYTECOUNT; i++ {
		for j := 0; j < BIGINTBYTECOUNT-1; j++ {
			if byteCount > 0 {
				b[j] = b[j+1]
			}
		}
		if byteCount > 0 {
			b[BIGINTBYTECOUNT-1] = 0
		}
		byteCount--
	}
	count = count % 8
	bits := [BIGINTBYTECOUNT * 8]uint8{}
	for i := 0; i < BIGINTBYTECOUNT; i++ {
		v := uint8(b[BIGINTBYTECOUNT-1-i])
		x := uint8(128)
		for j := 0; j < 8; j++ {
			if v >= x {
				bits[i*8+j] = 1
				v -= x
			}
			x /= 2
		}
	}
	for i := 0; i < 8; i++ {
		for j := BIGINTBYTECOUNT*8 - 1; j > 0; j-- {
			bits[j] = bits[j-1]
		}
		bits[0] = 0
		for j := 0; j < BIGINTBYTECOUNT; j++ {
			if i < count {
				v := bits[j*8+0] * 128
				v += bits[j*8+1] * 64
				v += bits[j*8+2] * 32
				v += bits[j*8+3] * 16
				v += bits[j*8+4] * 8
				v += bits[j*8+5] * 4
				v += bits[j*8+6] * 2
				v += bits[j*8+7] * 1
				b[BIGINTBYTECOUNT-1-j] = byte(v)
			}
		}
	}
}
*/

func biguintRshift(a biguint, b *biguint, count int) {
	biguintAssign(b, a)
	rshiftWord(b, count/8)
	bits := uint8(count % 8)
	t1 := &biguint{}
	biguintAssign(t1, *b)
	for i := 0; i < BIGINTBYTECOUNT-1; i++ {
		t1[i] = orByte(rshiftByte(t1[i], bits), lshiftByte(t1[i+1], 8-bits))
	}
	t1[BIGINTBYTECOUNT-1] = rshiftByte(t1[BIGINTBYTECOUNT-1], bits)
	biguintAssignIfTrue(b, *t1, bits != 0)
}

/*
func biguintRshiftByOne(a *biguint) {
	bits := [BIGINTBYTECOUNT * 8]uint8{}
	for i := 0; i < BIGINTBYTECOUNT; i++ {
		v := uint8(a[BIGINTBYTECOUNT-1-i])
		x := uint8(128)
		for j := 0; j < 8; j++ {
			if v >= x {
				bits[i*8+j] = 1
				v -= x
			}
			x /= 2
		}
	}
	for i := BIGINTBYTECOUNT*8 - 1; i > 0; i-- {
		bits[i] = bits[i-1]
	}
	bits[0] = 0
	for i := 0; i < BIGINTBYTECOUNT; i++ {
		v := bits[i*8+0] * 128
		v += bits[i*8+1] * 64
		v += bits[i*8+2] * 32
		v += bits[i*8+3] * 16
		v += bits[i*8+4] * 8
		v += bits[i*8+5] * 4
		v += bits[i*8+6] * 2
		v += bits[i*8+7] * 1
		a[BIGINTBYTECOUNT-1-i] = byte(v)
	}
}
*/

func biguintRshiftByOne(a *biguint) {
	for i := 0; i < BIGINTBYTECOUNT-1; i++ {
		a[i] = orByte(rshiftByte(a[i], 1), lshiftByte(a[i+1], 8-1))
	}
	a[BIGINTBYTECOUNT-1] = rshiftByte(a[BIGINTBYTECOUNT-1], 1)
}

func biguintMod(ia, ib biguint, oc *biguint) {
	tc := biguint{}
	biguintDiv(ia, ib, oc)
	biguintMul(*oc, ib, &tc)
	biguintSub(ia, tc, oc)
}

func biguintAnd(a, b biguint, c *biguint) {
	for i := 0; i < BIGINTBYTECOUNT; i++ {
		c[i] = andByte(a[i], b[i])
	}
}

func biguintOr(a, b biguint, c *biguint) {
	for i := 0; i < BIGINTBYTECOUNT; i++ {
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

func biguintXor(a, b biguint, c *biguint) {
	for i := 0; i < BIGINTBYTECOUNT; i++ {
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

func biguintEquals(a, b biguint) bool {
	cmp := 0
	for i := BIGINTBYTECOUNT - 1; i >= 0; i-- {
		if cmp == 0 && a[i] > b[i] {
			cmp++
		}
		if cmp == 0 && a[i] < b[i] {
			cmp--
		}
	}
	return cmp == 0
}

func biguintLessThan(a, b biguint) bool {
	cmp := 0
	for i := BIGINTBYTECOUNT - 1; i >= 0; i-- {
		if cmp == 0 && a[i] > b[i] {
			cmp++
		}
		if cmp == 0 && a[i] < b[i] {
			cmp--
		}
	}
	return cmp < 0
}

func biguintLessThanOrEqual(a, b biguint) bool {
	cmp := 0
	for i := BIGINTBYTECOUNT - 1; i >= 0; i-- {
		if cmp == 0 && a[i] > b[i] {
			cmp++
		}
		if cmp == 0 && a[i] < b[i] {
			cmp--
		}
	}
	return cmp <= 0
}

func biguintGreaterThan(a, b biguint) bool {
	cmp := 0
	for i := BIGINTBYTECOUNT - 1; i >= 0; i-- {
		if cmp == 0 && a[i] > b[i] {
			cmp++
		}
		if cmp == 0 && a[i] < b[i] {
			cmp--
		}
	}
	return cmp > 0
}

func biguintGreaterThanOrEqual(a, b biguint) bool {
	cmp := 0
	for i := BIGINTBYTECOUNT - 1; i >= 0; i-- {
		if cmp == 0 && a[i] > b[i] {
			cmp++
		}
		if cmp == 0 && a[i] < b[i] {
			cmp--
		}
	}
	return cmp >= 0
}

func biguintPow(a, b biguint, c *biguint) {
	one := biguint{}
	one[0] = 1
	bIsZero := biguintEquals(b, biguint{})
	t1 := biguint{}
	t2 := biguint{}
	biguintAssign(&t1, a)
	biguintAssign(&t2, b)
	biguintSub(t2, one, &t2)
	if bIsZero == false {
		for i := 0; i < 8*BIGINTBYTECOUNT; i++ {
			if biguintEquals(t2, biguint{}) {
				break
			}
			biguintMul(t1, a, c)
			biguintSub(t2, one, &t2)
			biguintAssign(&t1, *c)
		}
	}
	biguintAssign(c, t1)
	for i := 0; i < BIGINTBYTECOUNT; i++ {
		t1[i] = 0
	}
	t1[0] = 1
	biguintAssignIfTrue(c, t1, bIsZero)
}

func biguintSqrt(a biguint, b *biguint) {
	one := biguint{}
	one[0] = 1
	low := biguint{}
	high := biguint{}
	mid := biguint{}
	t1 := biguint{}
	biguintAssign(&high, a)
	biguintRshift(high, &mid, 1)
	biguintAdd(mid, one, &mid)
	for i := 0; i < 8*BIGINTBYTECOUNT; i++ {
		if biguintLessThanOrEqual(high, low) {
			break
		}
		biguintMul(mid, mid, &t1)
		isGreaterThan := biguintGreaterThan(t1, a)
		biguintAssign(&t1, mid)
		biguintSub(t1, one, &t1)
		biguintAssignIfTrue(&high, t1, isGreaterThan)
		biguintAssignIfTrue(&low, mid, !isGreaterThan)
		biguintSub(high, low, &mid)
		biguintRshiftByOne(&mid)
		biguintAdd(low, mid, &mid)
		biguintAdd(mid, one, &mid)
	}
	biguintAssign(b, low)
}

func biguintAssign(dst *biguint, src biguint) {
	for i := 0; i < BIGINTBYTECOUNT; i++ {
		dst[i] = src[i]
	}
}

func biguintAssignIfTrue(dst *biguint, src biguint, b bool) {
	for i := 0; i < BIGINTBYTECOUNT; i++ {
		if b {
			dst[i] = src[i]
		}
	}
}

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////

func rshiftWord(a *biguint, count int) {
	for i := 0; i < BIGINTBYTECOUNT; i++ {
		if i+count < BIGINTBYTECOUNT {
			a[i] = a[i+count]
		} else {
			a[i] = 0
		}
	}
}

func lshiftWord(a *biguint, count int) {
	for i := BIGINTBYTECOUNT - 1; i >= 0; i-- {
		if i-count >= 0 {
			a[i] = a[i-count]
		} else {
			a[i] = 0
		}
	}
}

func lshiftByte(i, m uint8) uint8 {
	// return i * uint8(math.Pow(2, float64(m%8)))
	if m == 0 {
		i *= 1
	} else if m == 1 {
		i *= 2
	} else if m == 2 {
		i *= 4
	} else if m == 3 {
		i *= 8
	} else if m == 4 {
		i *= 16
	} else if m == 5 {
		i *= 32
	} else if m == 6 {
		i *= 64
	} else if m == 7 {
		i *= 128
	}
	return i
}

func rshiftByte(i, m uint8) uint8 {
	// return i / uint8(math.Pow(2, float64(m%8)))
	if m == 0 {
		i /= 1
	} else if m == 1 {
		i /= 2
	} else if m == 2 {
		i /= 4
	} else if m == 3 {
		i /= 8
	} else if m == 4 {
		i /= 16
	} else if m == 5 {
		i /= 32
	} else if m == 6 {
		i /= 64
	} else if m == 7 {
		i /= 128
	}
	return i
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
