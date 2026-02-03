# frozen_string_literal: true

module Seed
  module Commons
    module Types
      module Types
        class Metadata < Internal::Types::Model
          field :id, -> { String }, optional: false, nullable: false
          field :data, -> { Internal::Types::Hash[String, String] }, optional: true, nullable: false
          field :json_string, -> { String }, optional: true, nullable: false, api_name: "jsonString"
        end
      end
    end
  end
end
