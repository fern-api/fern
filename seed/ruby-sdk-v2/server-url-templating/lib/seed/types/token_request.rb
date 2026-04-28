# frozen_string_literal: true

module Seed
  module Types
    class TokenRequest < Internal::Types::Model
      field :client_id, -> { String }, optional: false, nullable: false
      field :client_secret, -> { String }, optional: false, nullable: false
    end
  end
end
