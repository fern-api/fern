# frozen_string_literal: true

module Seed
  module Auth
    module Types
      class GetTokenRequest < Internal::Types::Model
        field :cid, -> { String }, optional: false, nullable: false
        field :csr, -> { String }, optional: false, nullable: false
        field :scp, -> { String }, optional: false, nullable: false
        field :entity_id, -> { String }, optional: false, nullable: false
        field :audience, -> { String }, optional: false, nullable: false
        field :grant_type, -> { String }, optional: false, nullable: false
        field :scope, -> { String }, optional: true, nullable: false
      end
    end
  end
end
