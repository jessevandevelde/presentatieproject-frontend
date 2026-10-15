# ROC Kompas frontend

Angular-frontend voor ROC Kompas van ROC Midden Nederland. Studenten en betrokkenen beantwoorden dertig stellingen over onderwijs, BPV en de aansluiting op het werkveld. De uitslag wordt geplaatst op twee neutrale assen:

- theoretisch ↔ praktisch;
- vernieuwend ↔ behoudend.

De stellingen behandelen vakkennis, houding en werknemersvaardigheden, communicatie en samenwerking, zelfstandigheid, BPV-begeleiding, contact tussen bedrijf en school, aansluiting op het werkveld en nieuwe technieken zoals AI.

## Starten

Start eerst de backend en voer daarna in deze map uit:

```sh
npm install
npm start
```

De frontend draait op `http://127.0.0.1:4200` en gebruikt de ontwikkelproxy voor de backend op poort 3000.

## Controles

- `npm run build`: productiebuild maken.
- `npm run typecheck`: TypeScript controleren.
- `npm run lint`: TypeScript, templates en CSS controleren.
- `npm test`: Angular-tests uitvoeren.
