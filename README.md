# tramites2csv

Genera una tabla en formato CSV de todos los trámites publicados en el [Catálogo de Trámites](https://tramites.gob.gt/).

## Detalles

```
cat servicios.json | node index.js
```

### Entrada

Recibe por STDIN un archivo JSON generado por el frontend del Catálogo dentro de la carpeta **__data** y lo convierte en un archivo CSV. El archivo de entrada debe estar en formato JSON Lines, con un objeto JSON minificado por línea. Se provee el archivo de ejemplo *servicios.jsonl*.

### Salida

Este script produce como salida un archivo CSV con todos los trámites publicados, uno por línea, con los siguientes campos:

- ID
- Institución
- Trámite
- URL
- URL Catálogo
- Descripción
- Normativa
- Requerimientos
- Pasos
- Costo
- Descripción Costo
- Tiempo de Respuesta
- Resultado
- Categoría

Se provee el archivo de ejemplo *tramites.csv*.
