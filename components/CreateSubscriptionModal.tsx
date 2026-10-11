import { clsx } from "clsx";
import dayjs from "dayjs";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/constants/theme";
import { icons } from "@/constants/icons";
import { posthog } from "@/lib/posthog";

const categories = [
  "Entertainment",
  "AI Tools",
  "Developer Tools",
  "Design",
  "Productivity",
  "Cloud",
  "Music",
  "Other",
] as const;

type Category = (typeof categories)[number];
type Frequency = "Monthly" | "Yearly";

const categoryColors: Record<Category, string> = {
  Entertainment: "#f5c542",
  "AI Tools": "#b8d4e3",
  "Developer Tools": "#e8def8",
  Design: "#b8e8d0",
  Productivity: "#d9e7a2",
  Cloud: "#c5d5f5",
  Music: "#f6b7a8",
  Other: "#e9d7be",
};

type CreateSubscriptionModalProps = {
  visible: boolean;
  onClose: () => void;
  onCreate: (subscription: Subscription) => void;
};

export default function CreateSubscriptionModal({
  visible,
  onClose,
  onCreate,
}: CreateSubscriptionModalProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [frequency, setFrequency] = useState<Frequency>("Monthly");
  const [category, setCategory] = useState<Category>("Entertainment");
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    price?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function resetForm() {
    setName("");
    setPrice("");
    setFrequency("Monthly");
    setCategory("Entertainment");
    setFieldErrors({});
    setIsSubmitting(false);
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function handleCreate() {
    const trimmedName = name.trim();
    const parsedPrice = Number(price.trim());
    const nextErrors: typeof fieldErrors = {};

    if (!trimmedName) {
      nextErrors.name = "Enter a subscription name.";
    }
    if (!price.trim() || !Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      nextErrors.price = "Enter a price greater than zero.";
    }

    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    const startDate = dayjs();
    const renewalDate =
      frequency === "Monthly"
        ? startDate.add(1, "month")
        : startDate.add(1, "year");
    const subscription: Subscription = {
      id: `subscription-${startDate.valueOf()}`,
      name: trimmedName,
      price: parsedPrice,
      frequency,
      category,
      status: "active",
      startDate: startDate.toISOString(),
      renewalDate: renewalDate.toISOString(),
      icon: icons.wallet,
      billing: frequency,
      color: categoryColors[category],
    };

    onCreate(subscription);

    posthog?.capture('subscription_created', {
      subscription_name: trimmedName,
      subscription_price: parsedPrice,
      subscription_frequency: frequency,
      subscription_category: category,
    })

    resetForm();
    onClose();
  }

  return (
    <Modal
      animationType="slide"
      onRequestClose={handleClose}
      transparent
      visible={visible}
    >
      <View className="modal-overlay">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close new subscription form"
          className="absolute inset-0"
          onPress={handleClose}
        />
        <KeyboardAvoidingView
          className="flex-1 justify-end"
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <SafeAreaView
            className="modal-container"
            edges={["bottom"]}
          >
            <View className="modal-header">
              <Text className="modal-title">New Subscription</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close"
                className="modal-close"
                hitSlop={8}
                onPress={handleClose}
              >
                <Text className="modal-close-text">×</Text>
              </Pressable>
            </View>

            <ScrollView
              className="max-h-full"
              contentContainerClassName="modal-body"
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View className="auth-field">
                <Text className="auth-label">Name</Text>
                <TextInput
                  accessibilityLabel="Subscription name"
                  accessibilityHint={fieldErrors.name}
                  className="auth-input"
                  editable={!isSubmitting}
                  onChangeText={(value) => {
                    setName(value);
                    setFieldErrors((current) => ({
                      ...current,
                      name: undefined,
                    }));
                  }}
                  placeholder="e.g. Netflix"
                  placeholderTextColor={colors.mutedForeground}
                  returnKeyType="next"
                  value={name}
                />
                {fieldErrors.name ? (
                  <Text className="auth-error">{fieldErrors.name}</Text>
                ) : null}
              </View>

              <View className="auth-field">
                <Text className="auth-label">Price</Text>
                <TextInput
                  accessibilityLabel="Subscription price"
                  accessibilityHint={fieldErrors.price}
                  className="auth-input"
                  editable={!isSubmitting}
                  keyboardType="decimal-pad"
                  onChangeText={(value) => {
                    setPrice(value);
                    setFieldErrors((current) => ({
                      ...current,
                      price: undefined,
                    }));
                  }}
                  placeholder="0.00"
                  placeholderTextColor={colors.mutedForeground}
                  returnKeyType="done"
                  value={price}
                />
                {fieldErrors.price ? (
                  <Text className="auth-error">{fieldErrors.price}</Text>
                ) : null}
              </View>

              <View className="auth-field">
                <Text className="auth-label">Frequency</Text>
                <View className="picker-row">
                  {(["Monthly", "Yearly"] as const).map((option) => {
                    const isSelected = frequency === option;
                    return (
                      <Pressable
                        key={option}
                        accessibilityRole="radio"
                        accessibilityState={{ selected: isSelected }}
                        className={clsx(
                          "picker-option",
                          isSelected && "picker-option-active",
                        )}
                        onPress={() => setFrequency(option)}
                      >
                        <Text
                          className={clsx(
                            "picker-option-text",
                            isSelected && "picker-option-text-active",
                          )}
                        >
                          {option}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View className="auth-field">
                <Text className="auth-label">Category</Text>
                <View className="category-scroll">
                  {categories.map((option) => {
                    const isSelected = category === option;
                    return (
                      <Pressable
                        key={option}
                        accessibilityRole="radio"
                        accessibilityState={{ selected: isSelected }}
                        className={clsx(
                          "category-chip",
                          isSelected && "category-chip-active",
                        )}
                        onPress={() => setCategory(option)}
                      >
                        <Text
                          className={clsx(
                            "category-chip-text",
                            isSelected && "category-chip-text-active",
                          )}
                        >
                          {option}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityState={{
                  disabled: isSubmitting,
                  busy: isSubmitting,
                }}
                className={clsx(
                  "auth-button",
                  isSubmitting && "auth-button-disabled",
                )}
                disabled={isSubmitting}
                onPress={handleCreate}
              >
                <Text className="auth-button-text">Add subscription</Text>
              </Pressable>
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
