package bignum

import (
	"math/big"
	"strings"
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

func BenchmarkBigNumMulSimple(b *testing.B) {
	n1, n2 := &bn{}, &bn{}
	bignumFromUint64(n1, 12345)
	for i := 0; i < b.N; i++ {
		bignumMulSimple(n1, 123, n2)
	}
}

func BenchmarkBigNumMulSmall(b *testing.B) {
	n1, n2 := &bn{}, &bn{}
	bignumFromUint64(n1, 12345)
	for i := 0; i < b.N; i++ {
		bignumMulSmall(n1, 123, n2)
	}
}

func BenchmarkBigNumDivSimple(b *testing.B) {
	n1, n2 := &bn{}, &bn{}
	bignumFromUint64(n1, 123456789)
	for i := 0; i < b.N; i++ {
		bignumDivSimple(n1, 123, n2)
	}
}

func BenchmarkBigNumModSimple(b *testing.B) {
	n1, n2 := &bn{}, &bn{}
	bignumFromUint64(n1, 123456789)
	for i := 0; i < b.N; i++ {
		bignumModSimple(n1, 123, n2)
	}
}

func BenchmarkBigNumMulComplex(b *testing.B) {
	n1, n2, n3 := &bn{}, &bn{}, &bn{}
	bignumFromUint64(n1, 12345)
	bignumFromUint64(n2, 123456789)
	for i := 0; i < b.N; i++ {
		bignumMul(n1, n2, n3)
	}
}

func BenchmarkBigNumDivComplex(b *testing.B) {
	n1, n2, n3 := &bn{}, &bn{}, &bn{}
	bignumFromUint64(n1, 123456789)
	bignumFromUint64(n2, 12345)
	for i := 0; i < b.N; i++ {
		bignumDiv(n1, n2, n3)
	}
}

func BenchmarkBigNumPowComplex(b *testing.B) {
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

func BenchmarkBigIntAdd(b *testing.B) {
	x, _ := new(big.Int).SetString("2222222222222", 10)
	y, _ := new(big.Int).SetString("3333333333333", 10)
	t := new(big.Int)
	for i := 0; i < b.N; i++ {
		t.Add(x, y)
	}
}

func BenchmarkBigIntMul(b *testing.B) {
	x, _ := new(big.Int).SetString("12345", 10)
	y, _ := new(big.Int).SetString("123456789", 10)
	t := new(big.Int)
	for i := 0; i < b.N; i++ {
		t.Mul(x, y)
	}
}

func BenchmarkBigIntDiv(b *testing.B) {
	x, _ := new(big.Int).SetString("123456789", 10)
	y, _ := new(big.Int).SetString("12345", 10)
	t := new(big.Int)
	for i := 0; i < b.N; i++ {
		t.Div(x, y)
	}
}

func BenchmarkBigIntPow(b *testing.B) {
	x, _ := new(big.Int).SetString("2222222222222", 10)
	y, _ := new(big.Int).SetString("30", 10)
	t := new(big.Int)
	for i := 0; i < b.N; i++ {
		t.Exp(x, y, nil)
	}
}

func BenchmarkBigIntSqrt(b *testing.B) {
	n, _ := new(big.Int).SetString("1"+strings.Repeat("0", 1001), 10)
	b.ResetTimer()
	t := new(big.Int)
	for i := 0; i < b.N; i++ {
		t.Sqrt(n)
	}
}
