# frozen_string_literal: true

module Seed
  module Service
    module Types
      class StoreResponse < Internal::Types::Model
        field :id, -> { String }, optional: false, nullable: false

        field :display_name, -> { String }, optional: false, nullable: false, api_name: "displayName"
      end
    end
  end
end
