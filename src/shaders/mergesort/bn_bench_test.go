package bignum

import (
	"testing"
)

func BenchmarkBigNumAdd(b *testing.B) {
	n1, n2, n3 := &bn{}, &bn{}, &bn{}
	bignumFromUint64(n1, 987654321)
	bignumFromUint64(n2, 123456789)
	for i := 0; i < b.N; i++ {
		bignumAdd(n1, n2, n3)
	}
}

func BenchmarkBigNumSub(b *testing.B) {
	n1, n2, n3 := &bn{}, &bn{}, &bn{}
	bignumFromUint64(n1, 987654321)
	bignumFromUint64(n2, 123456789)
	for i := 0; i < b.N; i++ {
		bignumAdd(n1, n2, n3)
	}
}

func BenchmarkBigNumMultiply123(b *testing.B) {
	n1, n2, n3 := &bn{}, &bn{}, &bn{}
	bignumFromUint64(n1, 123456789)
	bignumFromUint64(n2, 123)
	for i := 0; i < b.N; i++ {
		bignumMul(n1, n2, n3)
	}
}

func BenchmarkBigNumMultiply4096(b *testing.B) {
	n1, n2, n3 := &bn{}, &bn{}, &bn{}
	bignumFromUint64(n1, 123456789)
	bignumFromUint64(n2, 4096)
	for i := 0; i < b.N; i++ {
		bignumMul(n1, n2, n3)
	}
}

func BenchmarkBigNumMultiplyComplex(b *testing.B) {
	n1, n2, n3 := &bn{}, &bn{}, &bn{}
	bignumFromUint64(n1, 123456789)
	bignumFromUint64(n2, 123456789123456789)
	for i := 0; i < b.N; i++ {
		bignumMul(n1, n2, n3)
	}
}

func BenchmarkBigNumDivide123(b *testing.B) {
	n1, n2, n3 := &bn{}, &bn{}, &bn{}
	bignumFromUint64(n1, 123456789)
	bignumFromUint64(n2, 123)
	for i := 0; i < b.N; i++ {
		bignumDiv(n1, n2, n3)
	}
}

func BenchmarkBigNumDivide4096(b *testing.B) {
	n1, n2, n3 := &bn{}, &bn{}, &bn{}
	bignumFromUint64(n1, 123456789)
	bignumFromUint64(n2, 4096)
	for i := 0; i < b.N; i++ {
		bignumDiv(n1, n2, n3)
	}
}

func BenchmarkBigNumDivideComplex(b *testing.B) {
	n1, n2, n3 := &bn{}, &bn{}, &bn{}
	bignumFromUint64(n1, 123456789123456789)
	bignumFromUint64(n2, 123456789)
	for i := 0; i < b.N; i++ {
		bignumDiv(n1, n2, n3)
	}
}

func BenchmarkBigNumPowerComplex(b *testing.B) {
	n1, n2, n3 := &bn{}, &bn{}, &bn{}
	bignumFromUint64(n1, 2)
	bignumFromUint64(n2, 30)
	for i := 0; i < b.N; i++ {
		bignumPow(n1, n2, n3)
	}
}

func BenchmarkBigNumSqrtComplex(b *testing.B) {
	n1, n2 := &bn{}, &bn{}
	bignumFromUint64(n1, 283733)
	for i := 0; i < b.N; i++ {
		bignumSqrt(n1, n2)
	}
}
