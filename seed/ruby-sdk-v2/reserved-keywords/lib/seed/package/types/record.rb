# frozen_string_literal: true

require_relative "../../../seed"

module Seed
  module Package
    module Types
      class Record < Internal::Types::Model
        field :foo, -> { Internal::Types::Hash[String, String] }, optional: false, nullable: false

        field :_3d, -> { Integer }, optional: false, nullable: false, api_name: "3d"
      end
    end
  end
end
