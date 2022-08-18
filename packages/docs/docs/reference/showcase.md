---
sidebar_position: 10
title: Showcase
---

### Connect Earth helps embed sustainability into financial products.

```yaml
imports:
  transaction: transaction.yml

types:
  ChartTransaction:
    extends: transaction.Transaction
    properties:
      group:
        docs: Chart group or category of the transaction
        type: string

  PieChart:
    properties:
      emissions_total: double
      transaction_count: integer
      recommendations: list<Recommendation>
      groups: list<Group>

  Recommendation:
    properties:
      content: string
      type: string
      source: optional<string>

  Group:
    properties:
      group: string
      result: GroupResult

  GroupResult:
    properties:
      emissions: double
      count: integer
      fraction_of_total: double

  PieRequest:
    properties:
      transactions: list<ChartTransaction>
      geo: optional<string>

services:
  http:
    ChartsService:
      docs: The charting API allows you to support graphs and analytics in your apps.
      auth: bearer
      base-path: /charts
      endpoints:
        pie:
          path: /pie
          method: POST
          request: PieRequest
          response: PieChart
```

### Telematica is a unified API for electric vehicles.

```yaml
ids:
  - name: VehicleId
    docs: |
      24-char hex identifier for the vehicle. The owner must have provided
      consent through Telematica consent flow.
types:
  ILocation:
    properties:
      lat: double
      lng: double
  SocResponse:
    properties:
      soc: integer
  RangeResponse:
    properties:
      range: integer
  RangeSocResponse:
    properties:
      soc: integer
      range: integer
  LocationResponse:
    properties:
      location: ILocation
  OdoResponse:
    properties:
      odo: integer
  StaticAttributes:
    properties:
      vin: string
      model: string
      year: integer
      make: string
      registration: string
services:
  http:
    VehicleDataService:
      base-path: /vehicle-data
      auth: bearer
      endpoints:
        getSOC:
          method: GET
          path: /soc
          query-parameters:
            vehicleId: VehicleId
          response: SocResponse
        getRange:
          method: GET
          path: /range
          query-parameters:
            vehicleId: VehicleId
          response: RangeResponse
        getRangeSoc:
          method: GET
          path: /range-soc
          query-parameters:
            vehicleId: VehicleId
          response: RangeSocResponse
        getLocation:
          method: GET
          path: /location
          query-parameters:
            vehicleId: VehicleId
          response: LocationResponse
        getOdo:
          method: GET
          path: /odo
          query-parameters:
            vehicleId: VehicleId
          response: OdoResponse
        getStaticAttributes:
          method: GET
          path: /static-attributes
          query-parameters:
            vehicleId: VehicleId
          response: StaticAttributes
    VehicleDataTestService:
      # The Vehicle Data Test service should really live on a different base-path
      # /vehicle-data/test instead of modifying the path for each endpoint.
      base-path: /vehicle-data
      auth: bearer
      endpoints:
        getSOCTest:
          method: GET
          path: /soc/test
          query-parameters:
            vehicleId: VehicleId
          response: SocResponse
        getRangeTest:
          method: GET
          path: /range/test
          query-parameters:
            vehicleId: VehicleId
          response: RangeResponse
        getRangeSocTest:
          method: GET
          path: /range-soc/test
          query-parameters:
            vehicleId: VehicleId
          response: RangeSocResponse
        getLocationTest:
          method: GET
          path: /location/test
          query-parameters:
            vehicleId: VehicleId
          response: LocationResponse
        getOdoTest:
          method: GET
          path: /odo/test
          query-parameters:
            vehicleId: VehicleId
          response: OdoResponse
        getStaticAttributesTest:
          method: GET
          path: /static-attributes/test
          query-parameters:
            vehicleId: VehicleId
          response: StaticAttributes
```
