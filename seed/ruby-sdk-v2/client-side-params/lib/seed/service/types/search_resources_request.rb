# frozen_string_literal: true

module Seed
  module Service
    module Types
      class SearchResourcesRequest < Internal::Types::Model
        field :limit, -> { Integer }, optional: false, nullable: false
        field :offset, -> { Integer }, optional: false, nullable: false
        field :query, -> { String }, optional: true, nullable: false
        field :filters, lambda {
          Internal::Types::Hash[String, Internal::Types::Hash[String, Object]]
        }, optional: true, nullable: false
      end
    end
  end
end
