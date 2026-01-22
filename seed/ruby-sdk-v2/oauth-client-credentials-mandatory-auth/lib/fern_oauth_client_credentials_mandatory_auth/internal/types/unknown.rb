# frozen_string_literal: true

module FernOauthClientCredentialsMandatoryAuth
  module Internal
    module Types
      module Unknown
        include FernOauthClientCredentialsMandatoryAuth::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
