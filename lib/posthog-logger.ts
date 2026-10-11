import { posthog } from '@/lib/posthog'

type PostHogLogAttributes = Record<string, boolean | number | string>

export const posthogLogger = {
  info: (body: string, attributes: PostHogLogAttributes) => {
    posthog?.logger.info(body, attributes)
  },
}
