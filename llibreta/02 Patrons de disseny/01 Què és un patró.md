# Què és un patró de disseny

Un patró és una **solució provada a un problema de disseny que es repeteix**. No és codi per copiar, sinó una idea amb nom: quan dius «aquí hi va un Strategy», qualsevol desenvolupador entén l'estructura.

El catàleg clàssic és el llibre *Design Patterns* (1994), de Gamma, Helm, Johnson i Vlissides (la «Gang of Four» o GoF), amb 23 patrons en tres grups:

| Grup | Per a què | Exemples |
| --- | --- | --- |
| Creacionals | Com es creen els objectes | [Builder](Creacionals/Builder.md), Factory Method, Singleton |
| Estructurals | Com es combinen classes i objectes | Adapter, Decorator, Proxy, Composite |
| De comportament | Com es reparteixen les responsabilitats | [Strategy](De%20comportament/Strategy.md), Observer, Command, State |

## Com estudiar-los

1. Entén primer **el problema**: sense el problema, el patró sembla complicació de més.
2. Escriu una versió **sense** el patró i nota on fa mal quan cal canviar-la.
3. Refactoritza cap al patró i compara.
4. Busca'l al codi que ja fas servir (Spring i el JDK en són plens).

> **Compte:** el perill no és no saber patrons, és fer-los servir on no calen. Un `if` amb dos casos que no canviaran no necessita un Strategy.
