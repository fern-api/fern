# frozen_string_literal: true

require_relative "../../../seed"

module Seed
  module Union
    module Types
      class GetShapeRequest < Internal::Types::Model
        field :id, -> { String }, optional: false, nullable: false
      end
    end
  end
end
