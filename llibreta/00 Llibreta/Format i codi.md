# Format i codi

Aquesta pàgina és un resum ràpid del que es pot escriure a la llibreta. Obre-la a l'editor per veure'n el text.

## Text

Text amb **negreta**, *cursiva*, `codi dins de la línia` i un [enllaç a una altra pàgina](Imatges%20i%20Excalidraw.md).

- Una llista
- amb punts
  - i subpunts

1. Una llista
2. numerada

> **Idea clau:** una cita serveix per destacar el que no vull oblidar.

## Codi

Després de les tres cometes, el llenguatge: `java`, `js`, `python`, `sql`, `bash`, `json`, `xml`, `yaml`…

```java
public interface DiscountStrategy {
    BigDecimal apply(BigDecimal price);
}

// Cada estratègia és una classe petita i intercanviable.
public final class BlackFriday implements DiscountStrategy {
    @Override
    public BigDecimal apply(BigDecimal price) {
        return price.multiply(new BigDecimal("0.70"));
    }
}
```

```sql
SELECT s.name, COUNT(*) AS samples
FROM sample s
WHERE s.created_at >= '2026-01-01'
GROUP BY s.name;
```

## Taules

| Patró | Tipus | Resol |
| --- | --- | --- |
| Strategy | Comportament | Canviar un algorisme sense tocar qui el fa servir |
| Decorator | Estructura | Afegir comportament sense herència |
| Builder | Creació | Construir objectes amb molts paràmetres |
