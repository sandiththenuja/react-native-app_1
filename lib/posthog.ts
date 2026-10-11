import Constants from 'expo-constants'
import PostHog from 'posthog-react-native'

const projectToken = Constants.expoConfig?.extra?.posthogProjectToken
const host = Constants.expoConfig?.extra?.posthogHost

function getConfigurationError() {
  if (typeof projectToken !== 'string' || projectToken.length === 0) {
    return 'EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN is configured'
  }

  if (typeof host !== 'string' || host.length === 0) {
    return 'EXPO_PUBLIC_POSTHOG_HOST variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once EXPO_PUBLIC_POSTHOG_HOST is configured'
  }
}

const configurationError = getConfigurationError()

if (__DEV__ && configurationError) {
  throw new Error(configurationError)
}

export const posthog = configurationError
  ? undefined
  : new PostHog(projectToken, {
      host,
      captureAppLifecycleEvents: true,
      logs: {
        serviceName: 'app1-mobile',
        serviceVersion: Constants.expoConfig?.version,
        environment: __DEV__ ? 'development' : 'production',
      },
      errorTracking: {
        autocapture: {
          uncaughtExceptions: true,
          unhandledRejections: true,
          console: [],
        },
      },
    })
