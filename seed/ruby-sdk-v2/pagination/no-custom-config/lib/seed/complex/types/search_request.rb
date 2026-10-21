# frozen_string_literal: true

require_relative "../.."

module Seed
  module Complex
    module Types
      class SearchRequest < Internal::Types::Model
        field :pagination, -> { Seed::Complex::Types::StartingAfterPaging }, optional: true, nullable: false

        field :query, -> { Seed::Complex::Types::SearchRequestQuery }, optional: false, nullable: false
      end
    end
  end
end
