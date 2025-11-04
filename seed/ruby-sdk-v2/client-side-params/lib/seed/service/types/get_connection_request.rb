# frozen_string_literal: true

module Seed
  module Service
    module Types
      class GetConnectionRequest < Internal::Types::Model
        field :connection_id, -> { String }, optional: false, nullable: false, api_name: "connectionId"
        field :fields, -> { String }, optional: true, nullable: false
      end
    end
  end
end
