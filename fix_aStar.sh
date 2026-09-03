sed -i 's/const v = edge\.source === u ? e\.target : edge\.source;/const v = edge.source === u ? edge.target : edge.source;/g' src/algorithms/aStar.ts
