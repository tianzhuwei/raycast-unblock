export interface UserProfile {
  user: {
    orgs: {
      data: {
        id: string
      }[]
    }
  }
}

export interface TokenResponse {
  data: Data
}

interface Data {
  request_id: string
  session: Session
  session_jwt: string
  session_token: string
  status_code: number
  user: User
  __user: User
}

interface User {
  biometric_registrations: any[]
  created_at: Date
  crypto_wallets: any[]
  emails: Email[]
  name: Name
  password: null
  phone_numbers: any[]
  providers: Provider[]
  status: string
  totps: any[]
  trusted_metadata: TrustedMetadata
  untrusted_metadata: TrustedMetadata
  user_id: string
  webauthn_registrations: any[]
}

interface Email {
  email: string
  email_id: string
  verified: boolean
}

interface Name {
  first_name: string
  last_name: string
  middle_name: string
}

interface Provider {
  locale: string
  oauth_user_registration_id: string
  profile_picture_url: string
  provider_subject: string
  provider_type: string
}

interface TrustedMetadata {
}

interface Session {
  attributes: Attributes
  authentication_factors: AuthenticationFactor[]
  custom_claims: TrustedMetadata
  expires_at: Date
  last_accessed_at: Date
  session_id: string
  started_at: Date
  user_id: string
}

interface Attributes {
  ip_address: string
  user_agent: string
}

interface AuthenticationFactor {
  created_at: Date
  delivery_method: string
  google_oauth_factor: GoogleOauthFactor
  last_authenticated_at: Date
  type: string
  updated_at: Date
}

interface GoogleOauthFactor {
  email_id: string
  id: string
  provider_subject: string
}
