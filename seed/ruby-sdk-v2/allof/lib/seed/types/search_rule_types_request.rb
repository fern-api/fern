# frozen_string_literal: true

module Seed
  module Types
    class SearchRuleTypesRequest < Internal::Types::Model
      field :query, -> { String }, optional: true, nullable: false
    end
  end
end
