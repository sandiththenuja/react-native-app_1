import { clsx } from "clsx";
import { ActivityIndicator, Pressable, Text } from "react-native";
import { colors } from "@/constants/theme";

type AuthSubmitButtonProps = {
  title: string;
  pending: boolean;
  onPress: () => void;
};

export default function AuthSubmitButton({
  title,
  pending,
  onPress,
}: AuthSubmitButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: pending, busy: pending }}
      className={clsx("auth-button", pending && "auth-button-disabled")}
      disabled={pending}
      onPress={onPress}
    >
      {pending ? (
        <ActivityIndicator color={colors.foreground} />
      ) : (
        <Text className="auth-button-text">{title}</Text>
      )}
    </Pressable>
  );
}
