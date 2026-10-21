# frozen_string_literal: true

require_relative "../../seed"

module Seed
  module Types
    class AuthorizeResponse < Internal::Types::Model
      field :code, -> { String }, optional: false, nullable: false

      field :state, -> { String }, optional: true, nullable: false
    end
  end
end
