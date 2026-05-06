# frozen_string_literal: true

module Seed
  module Contacts
    module Types
      class ContactsGetRequest < Internal::Types::Model
        field :id, -> { String }, optional: false, nullable: false
      end
    end
  end
end
