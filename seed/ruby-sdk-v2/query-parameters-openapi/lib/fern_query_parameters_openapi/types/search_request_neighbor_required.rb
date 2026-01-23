# frozen_string_literal: true

module FernQueryParametersOpenapi
  module Types
    class SearchRequestNeighborRequired < Internal::Types::Model
      extend FernQueryParametersOpenapi::Internal::Types::Union

      member -> { FernQueryParametersOpenapi::Types::User }
      member -> { FernQueryParametersOpenapi::Types::NestedUser }
      member -> { String }
      member -> { Integer }
    end
  end
end
