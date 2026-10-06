# Builder

**Separa la construcció d'un objecte complex de la seva representació**: el construeixes pas a pas, amb noms, i al final en tens un d'acabat i vàlid.

## El problema

Un constructor amb molts paràmetres del mateix tipus és fàcil d'equivocar:

```java
// Quin és el límit de detecció i quin el de quantificació?
new Method("HPLC-UV", 254, 0.05, 0.15, 3, true, false);
```

## La solució

```java
Method method = Method.builder()
        .name("HPLC-UV")
        .wavelengthNm(254)
        .detectionLimit(0.05)
        .quantificationLimit(0.15)
        .replicates(3)
        .build(); // aquí es valida que l'objecte sigui coherent
```

```java
public final class Method {
    private final String name;
    private final int wavelengthNm;
    private final double detectionLimit;
    private final double quantificationLimit;
    private final int replicates;

    private Method(Builder b) {
        this.name = b.name;
        this.wavelengthNm = b.wavelengthNm;
        this.detectionLimit = b.detectionLimit;
        this.quantificationLimit = b.quantificationLimit;
        this.replicates = b.replicates;
    }

    public static Builder builder() { return new Builder(); }

    public static final class Builder {
        private String name;
        private int wavelengthNm;
        private double detectionLimit;
        private double quantificationLimit;
        private int replicates = 1;

        public Builder name(String name) { this.name = name; return this; }
        public Builder wavelengthNm(int nm) { this.wavelengthNm = nm; return this; }
        public Builder detectionLimit(double lod) { this.detectionLimit = lod; return this; }
        public Builder quantificationLimit(double loq) { this.quantificationLimit = loq; return this; }
        public Builder replicates(int n) { this.replicates = n; return this; }

        public Method build() {
            if (quantificationLimit < detectionLimit) {
                throw new IllegalStateException("El LOQ no pot ser més petit que el LOD");
            }
            return new Method(this);
        }
    }
}
```

## On el veus

- `HttpRequest.newBuilder()` de `java.net.http`.
- L'anotació `@Builder` de Lombok, que genera tot el codi de dalt.
- `UriComponentsBuilder` i `ResponseEntity.ok().header(...).body(...)` a Spring.

## Quan NO

Si l'objecte té dos o tres camps, un constructor o un `record` és més simple. Vegeu també [Què és un patró](../01%20Què%20és%20un%20patró.md).
