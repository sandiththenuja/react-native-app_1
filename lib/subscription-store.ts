import { useSyncExternalStore } from "react";
import { HOME_SUBSCRIPTIONS } from "@/constants/data";

let subscriptions = [...HOME_SUBSCRIPTIONS];
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return subscriptions;
}

function getServerSnapshot() {
  return HOME_SUBSCRIPTIONS;
}

export function addSubscription(subscription: Subscription) {
  subscriptions = [
    subscription,
    ...subscriptions.filter((item) => item.id !== subscription.id),
  ];
  listeners.forEach((listener) => listener());
}

export function useSubscriptions() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
