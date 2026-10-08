# frozen_string_literal: true

module Seed
  module Union
    module Types
      class Square < Internal::Types::Model
        field :length, -> { Float }, optional: false, nullable: false
      end
    end
  end
end
