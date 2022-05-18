# Fern definitions

</p>

A Fern definition is made up of one or more source YAML files. Each file may define multiple types, services, errors, and ids. Types may also be imported from other files. Source files must end in `.yml`.

Example file structure:

```text
weather-api/src/main/fern/report.yml
weather-api/src/main/fern/forecast.yml
weather-api/src/main/fern/commons.yml
```

## fern-imports

For example, one file called `commons.yml` might define a Fern type called `WeatherConditions`:

```yaml
types:
  properties:
    WeatherConditions:
      enum:
        - SUNNY
        - CLOUDY
        - RAINY
```

A separate file in the same directory, `example.yml`, can then reference types defined in `common.yml`:

```yaml
types:
  conjure-imports:
    common: common.yml
  definitions:
    default-package: com.palantir.product
    objects:
      SomeRequest:
        alias: common.ProductId
```
