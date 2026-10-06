# Casos límit

Pàgina per comprovar com es veu tot. Es pot esborrar quan vulguis.

## Llenguatges

```python
def mean(values: list[float]) -> float:
    """Mitjana d'una llista de mesures."""
    return sum(values) / len(values) if values else 0.0
```

```js
const unique = list => [...new Set(list)];
console.log(unique([1, 1, 2, 3]));
```

```typescript
interface Sample { id: string; concentration: number }
const valid = (s: Sample): boolean => s.concentration >= 0;
```

```bash
git switch -c feature/strategy && git commit -m "Add: Strategy notes"
```

```json
{ "version": 1, "pages": [{ "path": "inici.md", "title": "ArquiLearn" }] }
```

```yaml
spring:
  datasource:
    url: jdbc:h2:mem:lab
```

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

Sense llenguatge (no es pinta):

```
Text pla dins d'un bloc, amb els espais    respectats.
```

Una línia molt llarga ha de fer scroll dins del bloc, no a tota la pàgina:

```java
Map<String, List<Measurement>> byInstrument = measurements.stream().filter(m -> m.value() > 0).collect(Collectors.groupingBy(Measurement::instrument));
```

## Llistes

- [x] Tasca feta
- [ ] Tasca pendent
- Llista normal
  1. Numerada dins
  2. d'una altra
     - i encara més endins

## Títols

### Títol de nivell 3
#### Títol de nivell 4

---

## HTML dins del Markdown

Tecles: <kbd>Ctrl</kbd> + <kbd>S</kbd>. Text <mark>marcat</mark>, H<sub>2</sub>O i 10<sup>-3</sup> mol/L.

<details>
<summary>Un desplegable (per a respostes de repàs)</summary>

El contingut només es veu quan l'obres. Hi pot anar **format** i `codi`.
</details>

## Taula ampla

| Mètode | Tècnica | LOD | LOQ | Rang lineal | Repetibilitat | Reproductibilitat | Observacions |
| --- | --- | --- | --- | --- | --- | --- | --- |
| M-01 | HPLC-UV | 0,05 mg/L | 0,15 mg/L | 0,15–50 mg/L | 1,2 % | 2,8 % | Columna C18, fase mòbil ACN:H₂O |
| M-02 | ICP-MS | 0,01 µg/L | 0,03 µg/L | 0,03–100 µg/L | 2,1 % | 4,5 % | Patró intern Rh |

## Enllaços i imatges

- Extern (s'obre en una pestanya nova): [refactoring.guru](https://refactoring.guru/design-patterns)
- Una altra pàgina: [Strategy](../02%20Patrons%20de%20disseny/De%20comportament/Strategy.md)
- Una pàgina que no existeix: [No hi és](No%20hi%20és.md)

Una imatge que no existeix:

![Imatge perduda](img/no-existeix.png)
