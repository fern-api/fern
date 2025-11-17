# frozen_string_literal: true

module SeedAnyAuthClient
  class Auth
    # The type of grant being requested
    class GrantType
      AUTHORIZATION_CODE = "authorization_code"
      REFRESH_TOKEN = "refresh_token"
      CLIENT_CREDENTIALS = "client_credentials"
    end
  end
end
