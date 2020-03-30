package bignum

import "testing"

func TestGolden(t *testing.T) {
	failures := 0
	testData := getTestData()
	for _, oracle := range testData {
		res := &bn{}
		n1, n2, n3 := &bn{}, &bn{}, &bn{}
		bignumFromUint64(n1, oracle.a)
		bignumFromUint64(n2, oracle.b)
		bignumFromUint64(n3, oracle.c)
		switch oracle.op {
		case "+":
			bignumAdd(n1, n2, res)
			break
		case "-":
			bignumSub(n1, n2, res)
			break
		case "*":
			bignumMul(n1, n2, res)
			break
		case "/":
			bignumDiv(n1, n2, res)
			break
		case "%":
			bignumMod(n1, n2, res)
			break
		case "&":
			bignumAnd(n1, n2, res)
			break
		case "|":
			bignumOr(n1, n2, res)
			break
		case "^":
			bignumXor(n1, n2, res)
			break
		case "p":
			bignumPow(n1, n2, res)
			break
		case "<":
			bignumLshift(n1, res, int(oracle.b))
			break
		case ">":
			bignumRshift(n1, res, int(oracle.b))
			break
		default:
			panic("unknown operator detected")
		}
		if oracle.op == "p" {
			if bignumCmp(n3, res) == equal {
				t.Logf("[ OK ] pow(%v, %v) = %v\n", oracle.a, oracle.b, oracle.c)
			} else {
				t.Logf("[ FAIL ] pow(%v, %v) = %v\n", oracle.a, oracle.b, oracle.c)
				failures++
			}
		} else if oracle.op == "<" || oracle.op == ">" {
			if bignumCmp(n3, res) == equal {
				t.Logf("[ OK ] %v %v%v %v = %v\n", oracle.a, oracle.op, oracle.op, oracle.b, oracle.c)
			} else {
				t.Logf("[ FAIL ] %v %v%v %v = %v\n", oracle.a, oracle.op, oracle.op, oracle.b, oracle.c)
				failures++
			}
		} else {
			if bignumCmp(n3, res) == equal {
				t.Logf("[ OK ] %v %v %v = %v\n", oracle.a, oracle.op, oracle.b, oracle.c)
			} else {
				t.Logf("[ FAIL ] %v %v %v = %v\n", oracle.a, oracle.op, oracle.b, oracle.c)
				failures++
			}
		}
	}
	if failures > 0 {
		t.Error("at least one test failed")
	}
}

type td struct {
	op      string
	a, b, c uint64
}

func getTestData() []td {
	return []td{
		td{"+", 80, 20, 100},
		td{"+", 18, 22, 40},
		td{"+", 12, 8, 20},
		td{"+", 100080, 20, 100100},
		td{"+", 18, 559022, 559040},
		td{"+", 2000000000, 2000000000, 4000000000},
		td{"+", 0x00FFFF, 1, 0x010000},
		td{"+", 0x00FFFF00, 0x00000100, 0x01000000},
		td{"-", 1000001, 1000000, 1},
		td{"-", 42, 0, 42},
		td{"-", 101, 100, 1},
		td{"-", 242, 42, 200},
		td{"-", 1042, 0, 1042},
		td{"-", 101010101, 101010100, 1},
		td{"-", 0x010000, 1, 0x00FFFF},
		td{"-", 0xf505c2, 0x0fffe0, 0xe505e2},
		td{"-", 0x9f735a, 0x65ffb5, 0x3973a5},
		td{"-", 0xcf7810, 0x04ff34, 0xca78dc},
		td{"-", 0xbbc55f, 0x4eff76, 0x6cc5e9},
		td{"-", 0x100000, 1, 0x0fffff},
		td{"-", 0x010000, 1, 0x00ffff},
		td{"-", 0xb5beb4, 0x01ffc4, 0xb3bef0},
		td{"-", 0x707655, 0x50ffa8, 0x1f76ad},
		td{"-", 0xf0a990, 0x1cffd1, 0xd3a9bf},
		td{"*", 0x010203, 0x1020, 0x10407060},
		td{"*", 42, 0, 0},
		td{"*", 42, 1, 42},
		td{"*", 42, 2, 84},
		td{"*", 42, 10, 420},
		td{"*", 42, 100, 4200},
		td{"*", 420, 1000, 420000},
		td{"*", 200, 8, 1600},
		td{"*", 2, 256, 512},
		td{"*", 500, 2, 1000},
		td{"*", 500000, 2, 1000000},
		td{"*", 500, 500, 250000},
		td{"*", 1000000000, 2, 2000000000},
		td{"*", 2, 1000000000, 2000000000},
		td{"*", 1000000000, 4, 4000000000},
		td{"/", 0xFFFFFFFF, 0xFFFFFFFF, 1},
		td{"/", 0xFFFFFFFF, 0x10000, 0xFFFF},
		td{"/", 0xFFFFFFFF, 0x1000, 0xFFFFF},
		td{"/", 0xFFFFFFFF, 0x100, 0xFFFFFF},
		td{"/", 1000000, 1000, 1000},
		td{"/", 1000000, 10000, 100},
		td{"/", 1000000, 100000, 10},
		td{"/", 1000000, 1000000, 1},
		td{"/", 1000000, 10000000, 0},
		td{"/", 28, 7, 4},
		td{"/", 27, 7, 3},
		td{"/", 26, 7, 3},
		td{"/", 25, 7, 3},
		td{"/", 24, 7, 3},
		td{"/", 23, 7, 3},
		td{"/", 22, 7, 3},
		td{"/", 21, 7, 3},
		td{"/", 20, 7, 2},
		td{"/", 0, 12, 0},
		td{"/", 10, 1, 10},
		td{"/", 0xFFFFFFFF, 1, 0xFFFFFFFF},
		td{"/", 0xFFFFFFFF, 0x10000, 0xFFFF},
		td{"/", 0xb36627, 0x0dff95, 0x0c},
		td{"/", 0xe5a18e, 0x09ff82, 0x16},
		td{"/", 0x45edd0, 0x04ff1a, 0x0d},
		td{"%", 8, 3, 2},
		td{"%", 1024, 1000, 24},
		td{"%", 0xFFFFFF, 1234, 985},
		td{"%", 0xFFFFFFFF, 0xEF, 0x6D},
		td{"%", 12345678, 16384, 8526},
		td{"%", 0xe7a344, 0x71ffe8, 0x03a374},
		td{"%", 0xa3a9a1, 0x2ff44, 0x1d149},
		td{"%", 0xc128b2, 0x60ff61, 0x602951},
		td{"%", 0xDC2254, 0x517FEA, 0x392280},
		td{"%", 0x769c99, 0x2cffda, 0x1c9ce5},
		td{"%", 0xc19076, 0x31ffd4, 0x2b90fa},
		td{"&", 0xFFFFFFFF, 0x005500AA, 0x005500AA},
		td{"&", 7, 3, 3},
		td{"&", 0xFFFFFFFF, 0, 0},
		td{"&", 0, 0xFFFFFFFF, 0},
		td{"&", 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF},
		td{"|", 0xFFFFFFFF, 0, 0xFFFFFFFF},
		td{"|", 0, 0xFFFFFFFF, 0xFFFFFFFF},
		td{"|", 0x00000000, 0xFFFFFFFF, 0xFFFFFFFF},
		td{"|", 0x55555555, 0xAAAAAAAA, 0xFFFFFFFF},
		td{"|", 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF},
		td{"|", 4, 3, 7},
		td{"^", 7, 4, 3},
		td{"^", 0xFFFF, 0x5555, 0xAAAA},
		td{"^", 0x5555, 0xAAAA, 0xFFFF},
		td{"^", 0xAAAA, 0x5555, 0xFFFF},
		td{"^", 0x0000, 0xFFFF, 0xFFFF},
		td{"^", 0x5555, 0xFFFF, 0xAAAA},
		td{"^", 0xAAAA, 0xFFFF, 0x5555},
		td{"p", 2, 0, 1},
		td{"p", 2, 1, 2},
		td{"p", 2, 2, 4},
		td{"p", 2, 3, 8},
		td{"p", 2, 10, 1024},
		td{"p", 2, 20, 1048576},
		td{"p", 2, 30, 1073741824},
		td{"<", 1, 0, 1},
		td{"<", 1, 1, 2},
		td{"<", 1, 2, 4},
		td{"<", 1, 3, 8},
		td{"<", 1, 4, 16},
		td{"<", 1, 5, 32},
		td{"<", 1, 6, 64},
		td{"<", 1, 7, 128},
		td{"<", 1, 8, 256},
		td{"<", 1, 9, 512},
		td{"<", 1, 10, 1024},
		td{"<", 1, 11, 2048},
		td{"<", 1, 12, 4096},
		td{"<", 1, 13, 8192},
		td{"<", 1, 14, 16384},
		td{"<", 1, 15, 32768},
		td{"<", 1, 16, 65536},
		td{"<", 1, 17, 131072},
		td{"<", 1, 18, 262144},
		td{"<", 1, 19, 524288},
		td{"<", 1, 20, 1048576},
		td{"<", 0xdd, 0x18, 0xdd000000},
		td{"<", 0x68, 0x02, 0x01a0},
		td{">", 0xf6, 1, 0x7b},
		td{">", 0x1a, 1, 0x0d},
		td{">", 0xb0, 1, 0x58},
		td{">", 0xba, 1, 0x5d},
		td{">", 0x10, 3, 0x02},
		td{">", 0xe8, 4, 0x0e},
		td{">", 0x37, 4, 0x03},
		td{">", 0xa0, 7, 0x01},
		td{">", 1, 0, 1},
		td{">", 2, 1, 1},
		td{">", 4, 2, 1},
		td{">", 8, 3, 1},
		td{">", 16, 4, 1},
		td{">", 32, 5, 1},
		td{">", 64, 6, 1},
		td{">", 128, 7, 1},
		td{">", 256, 8, 1},
		td{">", 512, 9, 1},
		td{">", 1024, 10, 1},
		td{">", 2048, 11, 1},
		td{">", 4096, 12, 1},
		td{">", 8192, 13, 1},
		td{">", 16384, 14, 1},
		td{">", 32768, 15, 1},
		td{">", 65536, 16, 1},
		td{">", 131072, 17, 1},
		td{">", 262144, 18, 1},
		td{">", 524288, 19, 1},
		td{">", 1048576, 20, 1},
	}
}
