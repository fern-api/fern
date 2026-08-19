# frozen_string_literal: true

module Seed
  module Types
    class RuleTypeSearchResponse < Internal::Types::Model
      field :paging, -> { Seed::Types::PagingCursors }, optional: false, nullable: false

      field :results, -> { Internal::Types::Array[Seed::Types::RuleType] }, optional: true, nullable: false
    end
  end
end
