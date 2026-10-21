# frozen_string_literal: true

require_relative "../.."

module Seed
  module Union
    module Types
      class Square < Internal::Types::Model
        field :length, -> { Float }, optional: false, nullable: false
      end
    end
  end
end
