# frozen_string_literal: true

module FernQueryParametersOpenapiAsObjects
  module Types
    class SearchRequestNeighbor < Internal::Types::Model
      extend FernQueryParametersOpenapiAsObjects::Internal::Types::Union

      member -> { FernQueryParametersOpenapiAsObjects::Types::User }
      member -> { FernQueryParametersOpenapiAsObjects::Types::NestedUser }
      member -> { String }
      member -> { Integer }
    end
  end
end
