# Principis SOLID

Cinc principis de disseny orientat a objectes, recollits per Robert C. Martin. No són lleis: són senyals que t'ajuden a detectar quan el codi serà difícil de canviar.

| Lletra | Principi | En una frase |
| --- | --- | --- |
| **S** | Single Responsibility | Una classe només hauria de tenir un motiu per canviar. |
| **O** | Open/Closed | Obert a l'extensió, tancat a la modificació. |
| **L** | Liskov Substitution | Una subclasse s'ha de poder fer servir allà on s'espera la classe base. |
| **I** | Interface Segregation | Millor diverses interfícies petites que una de grossa. |
| **D** | Dependency Inversion | Depèn d'abstraccions, no d'implementacions concretes. |

## S: una responsabilitat

Aquesta classe té tres motius per canviar: el càlcul, el format de l'informe i on es desa.

```java
public class SampleReport {
    public double average(List<Double> values) { /* ... */ }
    public String toPdf() { /* ... */ }
    public void saveToDisk(Path path) { /* ... */ }
}
```

Separada, cada peça canvia per un sol motiu:

```java
public class Statistics { double average(List<Double> values) { /* ... */ } }
public class PdfReportFormatter { String format(Report report) { /* ... */ } }
public class ReportRepository { void save(Report report) { /* ... */ } }
```

> **Com detectar-ho:** si per explicar què fa la classe necessites dir «i», probablement en fa massa.

## D: inversió de dependències

És el principi que hi ha darrere de la injecció de dependències de Spring. El servei depèn d'una interfície, i Spring hi injecta la implementació:

```java
@Service
public class AnalysisService {
    private final SampleRepository repository; // interfície, no JpaSampleRepository

    public AnalysisService(SampleRepository repository) {
        this.repository = repository;
    }
}
```

Així, en una prova pots passar-hi una implementació en memòria sense tocar el servei.

## Preguntes de repàs

<details>
<summary>Quin principi trenca un <code>if (type == ...)</code> que creix cada vegada que hi ha un tipus nou?</summary>

L'**Open/Closed**: per afegir un tipus has de modificar el codi que ja funciona. El patró [Strategy](../02%20Patrons%20de%20disseny/De%20comportament/Strategy.md) és una manera de resoldre-ho.
</details>

<details>
<summary>Per què un <code>Square extends Rectangle</code> és l'exemple clàssic de Liskov?</summary>

Perquè si a un quadrat li canvies l'amplada, també li canvia l'alçada. El codi que espera un rectangle (i que l'amplada i l'alçada siguin independents) deixa de funcionar.
</details>
