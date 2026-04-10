# frozen_string_literal: true

module Seed
  module Types
    class SearchResultTwo < Internal::Types::Model
      field :type, -> { Seed::Types::SearchResultTwoType }, optional: false, nullable: false
    end
  end
end
