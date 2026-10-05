#!/usr/bin/env sh
# Gera public/data/brasil-uf.topo.json (27 UFs) a partir de uma malha estadual do IBGE.
#
# Uso:  sh scripts/build-map.sh <arquivo.shp|.json> [campo-da-sigla]
#
# A versão publicada usa uf/shapefile/uf.shp de github.com/fititnt/gis-dataset-brasil
# (malha estadual do IBGE redistribuída pelo extinto portal brasilemcidades.gov.br,
# licença DbCL), campo UF_05. Para usar a malha mais recente direto do IBGE, baixe
# BR_UF_2024.zip em https://www.ibge.gov.br/geociencias/organizacao-do-territorio/malhas-territoriais.html
# e rode:  sh scripts/build-map.sh BR_UF_2024.shp SIGLA_UF
#
# Passos: descarta ilhas oceânicas pequenas, projeta em Albers equivalente (metros,
# centrada no Brasil) e simplifica preservando as fronteiras compartilhadas.
set -e
SRC="${1:?informe o shapefile ou GeoJSON da malha estadual}"
FIELD="${2:-UF_05}"
OUT="public/data/brasil-uf.topo.json"

npx mapshaper -i "$SRC" name=estados \
  -each "uf = String($FIELD).toUpperCase()" \
  -filter-fields uf \
  -filter-islands min-area=150km2 remove-empty \
  -proj +proj=aea +lat_1=-2 +lat_2=-22 +lat_0=-12 +lon_0=-54 +datum=WGS84 +units=m \
  -simplify 10% weighted keep-shapes \
  -o "$OUT" format=topojson quantization=20000 id-field=uf
echo "ok: $OUT"
