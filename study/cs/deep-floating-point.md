# 딥다이브 — 부동소수(IEEE 754): 왜 0.1 + 0.2 ≠ 0.3

> Java 개발자 관점의 딥다이브. `float`/`double`은 **2진 부동소수(IEEE 754)** 이고, 우리가 익숙한 10진 소수와 표현 체계가 다르다. 그 간극에서 모든 버그가 나온다.
> 관련 노트: [cs-foundations.md](cs-foundations.md), [data-structures-java.md](data-structures-java.md)

---

## 0. 30초 직관 — 2진법으로 1/3 적어보기

10진법으로 `1/3`을 적으면 `0.3333...` 로 **끝나지 않는다**. 3으로 나누어떨어지지 않기 때문이다. 그렇다고 3이 이상한 수는 아니다. 그냥 10진법의 밑(10 = 2 × 5)이 3을 유한 자리로 담지 못할 뿐이다.

2진 부동소수의 세계도 똑같다. 2진법의 밑은 2뿐이라, **분모가 2의 거듭제곱이 아닌 분수는 유한 자리로 못 적는다.** `0.1`(= 1/10, 분모에 5가 있음)은 2진법에서 이렇게 된다.

```
0.1(10진) = 0.0001100110011001100110011... (2진, 0011이 무한 반복)
```

`double`은 이 무한 소수를 **딱 52비트에서 잘라 반올림**해서 저장한다. 즉 컴퓨터에 들어간 값은 "정확한 0.1"이 아니라 "0.1에 가장 가까운 대표값"이다. `0.1`, `0.2`, `0.3` 각각이 미세하게 어긋난 채 저장되고, `0.1 + 0.2`의 반올림 오차가 `0.3`의 반올림 오차와 우연히 맞지 않아서 `0.30000000000000004`가 나온다.

**핵심 한 줄:** `double`은 "10진 소수"를 저장하는 게 아니라 "2진 소수로 반올림한 근사값"을 저장한다. 그래서 `==`는 거짓말을 한다.

---

## 1. IEEE 754 비트 레이아웃

부동소수는 과학적 표기법의 2진 버전이다. `값 = (-1)^sign × 1.mantissa × 2^(exponent - bias)`.

| 타입 | 전체 | 부호(sign) | 지수(exponent) | 가수(mantissa/significand) | bias |
|------|------|-----------|----------------|----------------------------|------|
| `float` (32bit) | 1 + 8 + 23 | 1비트 | 8비트 | 23비트 | 127 |
| `double` (64bit) | 1 + 11 + 52 | 1비트 | 11비트 | 52비트 | 1023 |

**세 부분의 역할:**

- **sign (부호)**: 0이면 양수, 1이면 음수. 딱 1비트. 그래서 `+0.0`과 `-0.0`이 따로 존재한다(§4).
- **exponent (지수)**: 소수점을 좌우로 몇 칸 옮길지. **bias(편향)** 를 더해 저장한다. `double`은 실제 지수에 1023을 더해 저장하므로, 저장값 1023이 실제 지수 0을 뜻한다. 이렇게 하면 지수 필드가 항상 0 이상의 부호 없는 정수가 되어, 지수의 대소 비교가 곧 비트 패턴의 대소 비교가 된다(정렬·비교 하드웨어가 단순해짐).
- **mantissa (가수)**: 유효숫자. 정규화된 수는 항상 `1.xxxx` 형태라 맨 앞의 `1`은 **저장하지 않는다(hidden bit, 암묵적 1)**. 그래서 `double`은 52비트를 저장하지만 실질 정밀도는 53비트다.

*(도식 설명: 64비트 double을 왼쪽부터 [부호 1비트][지수 11비트][가수 52비트] 세 칸으로 나눈 막대. 부호는 ±를, 지수는 2의 몇 승인지를, 가수는 1.xxxx의 소수부를 담는다.)*

### 정규수 vs 비정규수 vs 특수값

지수 필드 값에 따라 의미가 갈린다(double 기준).

- 지수 `000...0`(전부 0): **비정규수(subnormal)**. hidden bit가 0이 되어 0 근처의 아주 작은 수를 표현(점진적 언더플로).
- 지수 `111...1`(전부 1): **특수값**. 가수가 0이면 `±Infinity`, 0이 아니면 `NaN`.
- 그 사이: **정규수(normal)**, hidden bit 1.

---

## 2. 왜 0.1 + 0.2 == 0.30000000000000004 인가

세 값이 double에 저장될 때 이미 어긋나 있다. 각 값의 "실제 저장된 정확한 10진 전개"는 대략 이렇다.

```
저장된 0.1 ≈ 0.1000000000000000055511151231257827021181583404541015625
저장된 0.2 ≈ 0.2000000000000000111022302462515654042363166809082031250
합        ≈ 0.3000000000000000444089209850062616169452667236328125
저장된 0.3 ≈ 0.2999999999999999888977697537484345957636833190917968750
```

`0.1`의 오차(+)와 `0.2`의 오차(+)가 더해지면서 커졌고, 그 합에 가장 가까운 double은 `0.3`에 가장 가까운 double과 **다른 비트 패턴**이다. 그래서 `==`가 거짓이 된다.

```java
public class FloatDemo {
    public static void main(String[] args) {
        double a = 0.1, b = 0.2;
        double sum = a + b;

        System.out.println(sum);              // 0.30000000000000004
        System.out.println(sum == 0.3);       // false
        System.out.println(sum - 0.3);        // 5.551115123125783E-17

        // 저장된 값의 실제 정체를 BigDecimal로 들여다보기
        System.out.println(new BigDecimal(0.1));
        // 0.1000000000000000055511151231257827021181583404541015625
        System.out.println(new BigDecimal(0.3));
        // 0.299999999999999988897769753748434595763683319091796875
    }
}
```

> 참고: `0.5`, `0.25`, `0.75`처럼 **분모가 2의 거듭제곱**인 값은 2진법에서 유한하게 떨어져 오차가 없다. `0.1 + 0.2` 문제는 "모든 소수"가 아니라 "2로 안 떨어지는 소수"의 문제다.

---

## 3. 정밀도 — 몇 자리까지 믿을 수 있나

정밀도는 가수 비트 수에서 나온다.

- `float`: 23비트(+hidden 1) → 약 `2^24` ≈ 1670만 단계 → **10진 유효숫자 약 7자리**.
- `double`: 52비트(+hidden 1) → 약 `2^53` ≈ 9경 단계 → **10진 유효숫자 약 15~17자리**.

"약 7자리 / 15~17자리"라는 말은 **절대 오차가 아니라 상대 오차**를 뜻한다. 부동소수의 간격(ulp, unit in the last place)은 값이 커질수록 벌어진다. `1.0` 근처에서는 촘촘하지만, `2^53`을 넘어가면 double조차 인접 정수 사이 간격이 1보다 커져서 **연속된 정수를 표현하지 못한다.**

```java
double big = 9_007_199_254_740_992.0; // 2^53
System.out.println(big == big + 1);   // true (+1이 반영 안 됨!)
System.out.println(Math.ulp(1.0));    // 2.220446049250313E-16
System.out.println(Math.ulp(1e16));  // 2.0  (이 근방에선 간격이 2)
```

`Math.ulp(x)`는 x에서 다음 표현 가능한 double까지의 거리다. 오차 허용치(epsilon)를 값의 크기에 맞춰 잡을 때 유용하다.

---

## 4. 특수값과 그 함정 — NaN, ±Infinity, -0.0

### NaN (Not a Number)

`0.0/0.0`, `Math.sqrt(-1)`, `Infinity - Infinity` 등 정의 불가한 연산의 결과. **가장 악명 높은 성질: `NaN`은 자기 자신과도 같지 않다.**

```java
double nan = 0.0 / 0.0;
System.out.println(nan == nan);            // false  (!!)
System.out.println(nan != nan);            // true
System.out.println(Double.isNaN(nan));     // true  ← 올바른 검사법

// 그래서 정렬·컬렉션에서 조심해야 함
System.out.println(Double.compare(nan, nan)); // 0   (compare는 NaN==NaN 취급)
System.out.println(nan < 1.0);             // false
System.out.println(nan > 1.0);             // false  (모든 순서 비교가 false)
```

`nan == nan`이 `false`인 이유: IEEE 754에서 NaN은 "값이 없음"을 뜻하므로 어떤 순서 비교도 성립하지 않는다(unordered). Java의 `==`는 이 규칙을 그대로 따른다. 반면 `Double.compare`와 `Double.equals`, 그리고 `Double`을 키로 쓰는 컬렉션은 **NaN을 자신과 같게, 그리고 모든 값보다 크게** 취급하는 별도(전순서, total order) 규칙을 쓴다. 이 이중성이 `double[]` 정렬과 `TreeSet<Double>` 동작 차이를 만든다.

### ±Infinity

지수 오버플로나 `1.0/0.0`의 결과. 예외가 아니라 값으로 흐른다.

```java
System.out.println(1.0 / 0.0);   // Infinity
System.out.println(-1.0 / 0.0);  // -Infinity
System.out.println(1.0 / 0.0 == Double.POSITIVE_INFINITY); // true
System.out.println(Double.POSITIVE_INFINITY - Double.POSITIVE_INFINITY); // NaN
```

> Java 함정: **정수 나눗셈** `1 / 0`은 `ArithmeticException`을 던지지만, **부동소수 나눗셈** `1.0 / 0.0`은 예외 없이 `Infinity`를 준다. 조용히 전파되다 뒤에서 `NaN`으로 터지는 게 더 위험하다.

### -0.0 (음의 0)

부호 비트가 별도라 `+0.0`과 `-0.0`이 따로 있다. 값으로는 같지만 비트가 다르다.

```java
System.out.println(0.0 == -0.0);                    // true  (값 비교)
System.out.println(Double.compare(0.0, -0.0));      // 1     (전순서: -0.0 < +0.0)
System.out.println(Double.valueOf(0.0).equals(-0.0)); // false (비트 기반)
System.out.println(1.0 / 0.0);                      // Infinity
System.out.println(1.0 / -0.0);                     // -Infinity  (부호 살아있음)
```

`HashMap<Double, ...>`이나 `equals`를 쓰면 `+0.0`과 `-0.0`이 **다른 키**가 되고, `==`나 산술에서는 같게 취급된다. 이 불일치가 미묘한 버그를 만든다.

---

## 5. 비결합성과 파국적 상쇄 (catastrophic cancellation)

수학에서는 `(a+b)+c == a+(b+c)`(결합법칙)가 성립하지만, **부동소수에서는 성립하지 않는다.** 각 덧셈마다 반올림이 일어나고, 반올림 순서가 결과를 바꾼다.

```java
double a = 1e308, b = -1e308, c = 1.0;
System.out.println((a + b) + c); // 1.0      (먼저 상쇄 → 1.0 살아남음)
System.out.println(a + (b + c)); // 0.0      (b+c에서 1.0이 흡수됨 → 0)
```

`b + c`에서 `1.0`은 `1e308`의 ulp(약 `1e292`)보다 훨씬 작아 **완전히 삼켜진다**(absorption). 그래서 큰 수들을 더할 때는 **작은 값부터 더하거나** Kahan summation 같은 보정 알고리즘을 쓴다.

**파국적 상쇄(catastrophic cancellation)**: 거의 같은 두 근사값을 뺄 때, 앞자리 유효숫자가 소거되고 뒤쪽 반올림 오차만 남아 상대 오차가 폭발하는 현상.

```java
// (x+1) - x 를 x가 클 때 계산하면 정밀도가 무너진다
double x = 1e16;
System.out.println((x + 1) - x); // 0.0  (정답 1이어야 하는데 사라짐)
```

Goldberg 논문의 핵심 메시지 중 하나가 바로 이것이다: 뺄셈에서 유효숫자가 사라지면(cancellation) 남은 자리의 오차가 결과 전체를 지배한다. 이차방정식 근의 공식처럼 `-b + sqrt(...)`가 상쇄를 일으키는 경우, 수식을 대수적으로 변형(유리화)해서 상쇄를 피하는 게 정석이다.

---

## 6. 돈 계산에 float/double을 절대 쓰지 마라

지금까지의 모든 성질이 한 곳으로 모인다: **금액은 정확해야 하는데 double은 부정확하다.**

```java
// 버그: 세금 계산이 1센트 틀린다
double price = 0.10, qty = 3;
System.out.println(price * qty);        // 0.30000000000000004
double total = 1.03 - 0.42;
System.out.println(total);              // 0.6100000000000001
System.out.println(total == 0.61);      // false → 결제 검증 실패
```

### 해법 A — BigDecimal (정석)

```java
import java.math.BigDecimal;
import java.math.RoundingMode;

BigDecimal price = new BigDecimal("0.10");   // ← 반드시 문자열 생성자!
BigDecimal qty   = new BigDecimal("3");
BigDecimal total = price.multiply(qty)
                        .setScale(2, RoundingMode.HALF_UP);
System.out.println(total);               // 0.30  (정확)
```

**BigDecimal의 함정 3가지:**

1. **`new BigDecimal(0.1)` vs `BigDecimal.valueOf(0.1)`** — `new BigDecimal(double)`은 **이미 오염된 double 비트**를 그대로 받아 `0.1000000000000000055...`가 된다. 반드시 **문자열** `new BigDecimal("0.1")`을 쓰거나, `BigDecimal.valueOf(0.1)`(내부적으로 `Double.toString`을 거쳐 `"0.1"`로 정규화)을 써라.

```java
System.out.println(new BigDecimal(0.1));       // 0.1000000000000000055511151231257827...
System.out.println(new BigDecimal("0.1"));     // 0.1
System.out.println(BigDecimal.valueOf(0.1));    // 0.1
```

2. **scale/RoundingMode를 항상 명시** — `1/3` 같은 나눗셈은 무한소수라 scale 없이 `divide`하면 `ArithmeticException`이 난다. `divide(y, 2, RoundingMode.HALF_UP)`처럼 자릿수와 반올림 모드를 지정하라.

3. **`equals` vs `compareTo`** — `BigDecimal`의 `equals`는 scale까지 비교해서 `"2.0".equals("2.00")`이 `false`다. 값만 비교하려면 `compareTo(...) == 0`을 써라.

```java
System.out.println(new BigDecimal("2.0").equals(new BigDecimal("2.00")));    // false
System.out.println(new BigDecimal("2.0").compareTo(new BigDecimal("2.00"))); // 0 (같음)
```

### 해법 B — 정수 최소단위(센트/원)

돈을 `long`으로 **최소 단위(센트, 원)** 저장. 통화 연산이 정수 덧셈/뺄셈뿐이라 빠르고 정확하다. 환율·이자처럼 나눗셈·반올림이 잦으면 BigDecimal이 낫다.

```java
long cents = 10 * 3; // 30센트, 오차 없음
```

---

## 7. float == 비교는 왜 틀리고, epsilon은 어떻게 잡나

`0.1 + 0.2 == 0.3`이 `false`이듯, **부동소수 결과를 `==`로 비교하면 안 된다.** 대신 "차이가 충분히 작은가"를 본다(허용 오차, epsilon/tolerance).

```java
// 나쁨
if (a == b) { ... }

// 절대 오차 — a, b가 1 근처일 때만 안전
double EPS = 1e-9;
if (Math.abs(a - b) < EPS) { ... }

// 상대 오차 — 값의 크기에 비례해 허용치를 키움 (큰 수에도 안전)
if (Math.abs(a - b) <= EPS * Math.max(Math.abs(a), Math.abs(b))) { ... }

// ulp 기반 — "몇 칸 이내"로 허용
if (Math.abs(a - b) <= 4 * Math.ulp(a)) { ... }
```

절대 epsilon은 `a`가 `1e12`처럼 크면 무의미해진다(그 근방 ulp가 이미 `1e-9`보다 큼). 그래서 **크기를 모르는 값은 상대 오차나 ulp 기준**이 안전하다. 단, `0.0` 근처 비교는 상대 오차가 분모 0 문제를 일으키니 절대 오차와 섞어 쓴다.

---

## 8. Java 세부 사항

- **`strictfp`** — 원래 플랫폼마다 중간 계산을 80비트 확장정밀도로 하느냐 마느냐가 달라 결과가 갈렸다. `strictfp`는 "모든 중간 결과도 엄격히 IEEE 754 double/float로" 강제해 **플랫폼 독립적 재현성**을 보장했다. **Java 17부터는 부동소수 연산이 항상 strict**가 되어(JEP 306) 키워드가 사실상 무의미(no-op)해졌다. 옛 코드에서 보이면 "재현성 보장 표시"로 읽으면 된다.
- **`Double.compare(a, b)` / `Float.compare`** — `==`와 다른 **전순서(total order)** 규칙: `-0.0 < +0.0`, `NaN`은 모든 값보다 크고 `NaN`끼리는 같음. 정렬·`Comparator`에서는 반드시 이것을 써라(`a < b ? -1 : ...` 수동 구현은 NaN/-0.0에서 깨진다).
- **`Math.ulp(x)`** — x 지점의 부동소수 간격. epsilon 자동 산정, 정밀도 한계 진단에 사용.
- **`Double.isNaN` / `Double.isInfinite` / `Double.isFinite`** — 특수값 검사는 `==` 말고 이 메서드로.
- **`Double.doubleToLongBits` vs `doubleToRawLongBits`** — 전자는 모든 NaN을 하나의 표준 NaN 비트로 정규화, 후자는 원본 비트 그대로. 비트 단위로 비교·해싱할 때 차이가 난다.
- **출력 규칙** — `Double.toString`은 "원래 double로 되돌아오는 가장 짧은 10진 표현"을 준다. 그래서 `0.1`을 출력하면 `0.1`로 보이지만(짧은 표현으로 충분), 실제 저장값은 §2의 긴 값이다. 화면에 `0.1`로 보인다고 정확히 `0.1`인 건 아니다.

---

## 용어 사전

| 용어 | 뜻 |
|------|-----|
| IEEE 754 | 부동소수 표현·연산의 국제 표준. `float`(binary32), `double`(binary64) |
| sign / exponent / mantissa | 부호 / 지수 / 가수(유효숫자). `(-1)^s × 1.m × 2^(e-bias)` |
| bias (편향) | 지수를 부호 없는 정수로 저장하려고 더하는 상수. float 127, double 1023 |
| hidden bit | 정규수의 맨 앞 암묵적 `1`. 저장 안 하지만 정밀도 1비트 추가 |
| subnormal (비정규수) | 0 근처를 표현하는 hidden bit=0인 수. 점진적 언더플로 |
| ulp | unit in the last place. 인접한 두 부동소수 사이 간격 |
| epsilon | 두 값을 "같다"고 볼 허용 오차 |
| catastrophic cancellation | 거의 같은 두 수의 뺄셈에서 유효숫자가 소거되며 오차가 지배적이 되는 현상 |
| absorption (흡수) | 큰 수에 아주 작은 수를 더할 때 작은 수가 반올림으로 사라지는 현상 |
| total order (전순서) | `-0.0 < +0.0`, `NaN`을 최대로 두는 `Double.compare`의 정렬 규칙 |
| strictfp | 중간 계산까지 IEEE 754로 강제(재현성). Java 17+ 기본, 사실상 no-op |

## 출처

- David Goldberg, *"What Every Computer Scientist Should Know About Floating-Point Arithmetic"* — 상쇄, 반올림 오차, ulp의 고전. https://docs.oracle.com/cd/E19957-01/806-3568/ncg_goldberg.html
- **IEEE 754** 표준(binary32/binary64 레이아웃, NaN·Infinity·-0.0·전순서 규칙, 반올림 모드)
- **CSAPP** (Bryant & O'Hallaron), *Computer Systems: A Programmer's Perspective*, Ch.2 — 정수/부동소수 표현, 정규·비정규수, 반올림
- Java 문서: `java.lang.Double`, `java.math.BigDecimal`, `java.lang.Math.ulp`, JEP 306(strictfp 기본화)

---

관련 노트: [cs-foundations.md](cs-foundations.md) · [data-structures-java.md](data-structures-java.md)
