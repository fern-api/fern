# frozen_string_literal: true

module Seed
  module Complex
    module Types
      class SearchRequest < Internal::Types::Model
        field :index, -> { String }, optional: false, nullable: false
        field :pagination, -> { Seed::Types::StartingAfterPaging }, optional: true, nullable: false
        field :query, -> { Seed::Types::SearchRequestQuery }, optional: false, nullable: false
      end
    end
  end
end
