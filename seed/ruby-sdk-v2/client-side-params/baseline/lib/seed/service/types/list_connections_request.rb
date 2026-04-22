# frozen_string_literal: true

module Seed
  module Service
    module Types
      class ListConnectionsRequest < Internal::Types::Model
        field :strategy, -> { String }, optional: true, nullable: false
        field :name, -> { String }, optional: true, nullable: false
        field :fields, -> { String }, optional: true, nullable: false
      end
    end
  end
end
