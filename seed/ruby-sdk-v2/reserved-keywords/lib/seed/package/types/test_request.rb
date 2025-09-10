# frozen_string_literal: true

module Seed
  module Package
    module Types
      class TestRequest < Internal::Types::Model
        field :for_, -> { String }, optional: false, nullable: false
      end
    end
  end
end
