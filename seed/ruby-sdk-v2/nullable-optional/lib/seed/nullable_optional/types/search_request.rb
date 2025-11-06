# frozen_string_literal: true

module Seed
  module NullableOptional
    module Types
      class SearchRequest < Internal::Types::Model
        field :query, -> { String }, optional: false, nullable: false
        field :filters, -> { Internal::Types::Hash[String, String] }, optional: true, nullable: false
        field :include_types, lambda {
          Internal::Types::Array[String]
        }, optional: false, nullable: true, api_name: "includeTypes"
      end
    end
  end
end
