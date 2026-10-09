import { clsx } from "clsx";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import type { TextInputProps } from "react-native";
import { colors } from "@/constants/theme";

type AuthTextFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  error?: string;
  secureEntry?: boolean;
  editable?: boolean;
  keyboardType?: TextInputProps["keyboardType"];
  textContentType?: TextInputProps["textContentType"];
  autoComplete?: TextInputProps["autoComplete"];
  returnKeyType?: TextInputProps["returnKeyType"];
  onSubmitEditing?: TextInputProps["onSubmitEditing"];
  onBlur?: TextInputProps["onBlur"];
  maxLength?: number;
  accessibilityHint?: string;
};

export default function AuthTextField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureEntry = false,
  editable = true,
  keyboardType,
  textContentType,
  autoComplete,
  returnKeyType,
  onSubmitEditing,
  onBlur,
  maxLength,
  accessibilityHint,
}: AuthTextFieldProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <View className="auth-field">
      <Text className="auth-label">{label}</Text>
      <View
        className={clsx(
          "auth-input-container",
          error && "auth-input-container-error",
        )}
      >
        <TextInput
          accessibilityLabel={label}
          accessibilityHint={
            [accessibilityHint, error ? `Error: ${error}` : undefined]
              .filter(Boolean)
              .join(" ") || undefined
          }
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete={autoComplete}
          className="auth-input-control"
          editable={editable}
          keyboardType={keyboardType}
          maxLength={maxLength}
          onBlur={onBlur}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmitEditing}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedForeground}
          returnKeyType={returnKeyType}
          secureTextEntry={secureEntry && !isVisible}
          textContentType={textContentType}
          value={value}
        />
        {secureEntry ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isVisible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
            accessibilityState={{ selected: isVisible }}
            className="auth-input-action"
            hitSlop={8}
            onPress={() => setIsVisible((visible) => !visible)}
          >
            <Text className="auth-input-action-text">
              {isVisible ? "Hide" : "Show"}
            </Text>
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text className="auth-error" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
