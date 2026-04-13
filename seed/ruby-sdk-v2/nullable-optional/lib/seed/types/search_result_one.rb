# frozen_string_literal: true

module Seed
  module Types
    class SearchResultOne < Internal::Types::Model
      field :type, -> { Seed::Types::SearchResultOneType }, optional: false, nullable: false
    end
  end
end
