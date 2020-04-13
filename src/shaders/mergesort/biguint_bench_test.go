package bignum

import (
	"testing"
)

func BenchmarkBigNumAdd(b *testing.B) {
	n1, n2, n3 := &biguint{}, &biguint{}, &biguint{}
	biguintFromUint64(n1, 987654321)
	biguintFromUint64(n2, 123456789)
	for i := 0; i < b.N; i++ {
		biguintAdd(n1, n2, n3)
	}
}

func BenchmarkBigNumSub(b *testing.B) {
	n1, n2, n3 := &biguint{}, &biguint{}, &biguint{}
	biguintFromUint64(n1, 987654321)
	biguintFromUint64(n2, 123456789)
	for i := 0; i < b.N; i++ {
		biguintAdd(n1, n2, n3)
	}
}

func BenchmarkBigNumLshift(b *testing.B) {
	n1 := &biguint{}
	biguintFromUint64(n1, 123456789)
	for i := 0; i < b.N; i++ {
		biguintLshift(n1, n1, 128)
	}
}

func BenchmarkBigNumRshift(b *testing.B) {
	n1 := &biguint{}
	biguintFromUint64(n1, 123456789)
	for i := 0; i < b.N; i++ {
		biguintRshift(n1, n1, 128)
	}
}

func BenchmarkBigNumMultiply123(b *testing.B) {
	n1, n2, n3 := &biguint{}, &biguint{}, &biguint{}
	biguintFromUint64(n1, 123456789)
	biguintFromUint64(n2, 123)
	for i := 0; i < b.N; i++ {
		biguintMul(n1, n2, n3)
	}
}

func BenchmarkBigNumMultiply4096(b *testing.B) {
	n1, n2, n3 := &biguint{}, &biguint{}, &biguint{}
	biguintFromUint64(n1, 123456789)
	biguintFromUint64(n2, 4096)
	for i := 0; i < b.N; i++ {
		biguintMul(n1, n2, n3)
	}
}

func BenchmarkBigNumMultiplyComplex(b *testing.B) {
	n1, n2, n3 := &biguint{}, &biguint{}, &biguint{}
	biguintFromUint64(n1, 123456789)
	biguintFromUint64(n2, 123456789123456789)
	for i := 0; i < b.N; i++ {
		biguintMul(n1, n2, n3)
	}
}

func BenchmarkBigNumDivide123(b *testing.B) {
	n1, n2, n3 := &biguint{}, &biguint{}, &biguint{}
	biguintFromUint64(n1, 123456789)
	biguintFromUint64(n2, 123)
	for i := 0; i < b.N; i++ {
		biguintDiv(n1, n2, n3)
	}
}

func BenchmarkBigNumDivide4096(b *testing.B) {
	n1, n2, n3 := &biguint{}, &biguint{}, &biguint{}
	biguintFromUint64(n1, 123456789)
	biguintFromUint64(n2, 4096)
	for i := 0; i < b.N; i++ {
		biguintDiv(n1, n2, n3)
	}
}

func BenchmarkBigNumDivideComplex(b *testing.B) {
	n1, n2, n3 := &biguint{}, &biguint{}, &biguint{}
	biguintFromUint64(n1, 123456789123456789)
	biguintFromUint64(n2, 123456789)
	for i := 0; i < b.N; i++ {
		biguintDiv(n1, n2, n3)
	}
}

func BenchmarkBigNumPowerComplex(b *testing.B) {
	n1, n2, n3 := &biguint{}, &biguint{}, &biguint{}
	biguintFromUint64(n1, 2)
	biguintFromUint64(n2, 30)
	for i := 0; i < b.N; i++ {
		biguintPow(n1, n2, n3)
	}
}

func BenchmarkBigNumSqrtComplex(b *testing.B) {
	n1, n2 := &biguint{}, &biguint{}
	biguintFromUint64(n1, 283733)
	for i := 0; i < b.N; i++ {
		biguintSqrt(n1, n2)
	}
}
