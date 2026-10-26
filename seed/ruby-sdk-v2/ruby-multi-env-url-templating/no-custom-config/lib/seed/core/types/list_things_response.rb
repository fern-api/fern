# frozen_string_literal: true

require_relative "../../../seed"

module Seed
  module Core
    module Types
      class ListThingsResponse < Internal::Types::Model
        field :id, -> { String }, optional: true, nullable: false
      end
    end
  end
end
