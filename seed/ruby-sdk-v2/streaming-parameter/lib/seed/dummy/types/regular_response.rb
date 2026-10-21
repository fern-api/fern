# frozen_string_literal: true

require_relative "../.."

module Seed
  module Dummy
    module Types
      class RegularResponse < Internal::Types::Model
        field :id, -> { String }, optional: false, nullable: false

        field :name, -> { String }, optional: true, nullable: false
      end
    end
  end
end
