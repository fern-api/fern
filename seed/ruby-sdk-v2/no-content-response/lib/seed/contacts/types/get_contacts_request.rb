# frozen_string_literal: true

module Seed
  module Contacts
    module Types
      class GetContactsRequest < Internal::Types::Model
        field :id, -> { String }, optional: false, nullable: false
      end
    end
  end
end
