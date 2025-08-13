# frozen_string_literal: true

module Seed
    module Types
        class SearchResponse < Internal::Types::Model
            field :results, Internal::Types::Array[String], optional: true, nullable: false

    end
end
